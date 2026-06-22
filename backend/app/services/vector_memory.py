"""
Qdrant-backed vector memory for AI agents.
Agents store and retrieve semantic memories using Gemini embeddings.
"""
from typing import List, Optional, Dict, Any
import logging
import hashlib

logger = logging.getLogger(__name__)


class VectorMemoryService:
    """
    Wraps Qdrant for agent long-term memory.
    Falls back to in-memory dict when Qdrant is unavailable.
    """

    def __init__(self, host: str = "localhost", port: int = 6333):
        self._client = None
        self._fallback: List[Dict] = []
        self._host = host
        self._port = port
        self._collection = "wateros_agent_memory"
        self._vector_size = 768  # Gemini embedding-001 output size

    def _get_client(self):
        if self._client is not None:
            return self._client
        try:
            from qdrant_client import QdrantClient
            from qdrant_client.models import Distance, VectorParams
            client = QdrantClient(host=self._host, port=self._port, timeout=5)
            # Ensure collection exists
            existing = [c.name for c in client.get_collections().collections]
            if self._collection not in existing:
                client.create_collection(
                    collection_name=self._collection,
                    vectors_config=VectorParams(size=self._vector_size, distance=Distance.COSINE),
                )
            self._client = client
            return client
        except Exception as e:
            logger.warning(f"Qdrant not available ({e}), using in-memory fallback")
            return None

    async def _embed(self, text: str) -> List[float]:
        """Generate embedding via Gemini or fallback to hash-based vector."""
        try:
            import google.generativeai as genai
            from app.core.config import settings
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            result = genai.embed_content(model="models/embedding-001", content=text)
            return result["embedding"]
        except Exception:
            # Deterministic fallback: hash → float vector
            h = hashlib.sha256(text.encode()).digest()
            vec = [b / 255.0 for b in h]
            # Pad or truncate to vector_size
            while len(vec) < self._vector_size:
                vec.extend(vec)
            return vec[: self._vector_size]

    async def store_memory(
        self,
        agent_id: str,
        content: str,
        metadata: Optional[Dict] = None,
    ) -> str:
        memory_id = hashlib.md5(f"{agent_id}{content}".encode()).hexdigest()
        vector = await self._embed(content)
        payload = {"agent_id": agent_id, "content": content, **(metadata or {})}

        client = self._get_client()
        if client:
            try:
                from qdrant_client.models import PointStruct
                client.upsert(
                    collection_name=self._collection,
                    points=[PointStruct(id=memory_id, vector=vector, payload=payload)],
                )
                logger.info(f"Memory stored in Qdrant: {memory_id}")
                return memory_id
            except Exception as e:
                logger.error(f"Qdrant store failed: {e}")

        # Fallback
        self._fallback.append({"id": memory_id, "vector": vector, "payload": payload})
        return memory_id

    async def search_memory(
        self,
        query: str,
        agent_id: Optional[str] = None,
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        query_vec = await self._embed(query)

        client = self._get_client()
        if client:
            try:
                from qdrant_client.models import Filter, FieldCondition, MatchValue
                query_filter = (
                    Filter(must=[FieldCondition(key="agent_id", match=MatchValue(value=agent_id))])
                    if agent_id else None
                )
                hits = client.search(
                    collection_name=self._collection,
                    query_vector=query_vec,
                    query_filter=query_filter,
                    limit=top_k,
                )
                return [{"id": h.id, "score": h.score, **h.payload} for h in hits]
            except Exception as e:
                logger.error(f"Qdrant search failed: {e}")

        # Fallback: cosine similarity over in-memory list
        def cosine(a: List[float], b: List[float]) -> float:
            dot = sum(x * y for x, y in zip(a, b))
            norm_a = sum(x ** 2 for x in a) ** 0.5
            norm_b = sum(x ** 2 for x in b) ** 0.5
            return dot / (norm_a * norm_b + 1e-9)

        candidates = self._fallback
        if agent_id:
            candidates = [m for m in candidates if m["payload"].get("agent_id") == agent_id]

        scored = sorted(candidates, key=lambda m: cosine(m["vector"], query_vec), reverse=True)
        return [{"id": m["id"], "score": cosine(m["vector"], query_vec), **m["payload"]} for m in scored[:top_k]]


vector_memory = VectorMemoryService()
