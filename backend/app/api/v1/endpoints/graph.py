from fastapi import APIRouter

router = APIRouter(prefix="/graph", tags=["Knowledge Graph"])

NODES = [
    # Countries
    {"id": "c_india", "label": "India", "type": "country", "properties": {"water_score": 62, "population": 1428000000}},
    {"id": "c_usa", "label": "United States", "type": "country", "properties": {"water_score": 78, "population": 331000000}},
    {"id": "c_brazil", "label": "Brazil", "type": "country", "properties": {"water_score": 71, "population": 215000000}},
    # States
    {"id": "s_mh", "label": "Maharashtra", "type": "state", "properties": {"water_score": 61, "country": "India"}},
    {"id": "s_tn", "label": "Tamil Nadu", "type": "state", "properties": {"water_score": 49, "country": "India"}},
    {"id": "s_up", "label": "Uttar Pradesh", "type": "state", "properties": {"water_score": 57, "country": "India"}},
    {"id": "s_ca", "label": "California", "type": "state", "properties": {"water_score": 58, "country": "USA"}},
    {"id": "s_tx", "label": "Texas", "type": "state", "properties": {"water_score": 64, "country": "USA"}},
    {"id": "s_am", "label": "Amazonas", "type": "state", "properties": {"water_score": 88, "country": "Brazil"}},
    {"id": "s_sp", "label": "São Paulo", "type": "state", "properties": {"water_score": 63, "country": "Brazil"}},
    # Cities
    {"id": "city_mum", "label": "Mumbai", "type": "city", "properties": {"population": 20667656, "water_quality": 74}},
    {"id": "city_che", "label": "Chennai", "type": "city", "properties": {"population": 7088000, "water_quality": 61}},
    {"id": "city_del", "label": "Delhi", "type": "city", "properties": {"population": 31181376, "water_quality": 68}},
    {"id": "city_lac", "label": "Los Angeles", "type": "city", "properties": {"population": 3979576, "water_quality": 83}},
    {"id": "city_hou", "label": "Houston", "type": "city", "properties": {"population": 2304580, "water_quality": 81}},
    {"id": "city_sao", "label": "São Paulo", "type": "city", "properties": {"population": 12325232, "water_quality": 72}},
    # Reservoirs
    {"id": "res_bhak", "label": "Bhakra Dam", "type": "reservoir", "properties": {"capacity_mcm": 9868, "current_pct": 71}},
    {"id": "res_shiv", "label": "Shivajisagar", "type": "reservoir", "properties": {"capacity_mcm": 2797, "current_pct": 58}},
    {"id": "res_hoo", "label": "Hoover Dam", "type": "reservoir", "properties": {"capacity_mcm": 36702, "current_pct": 28}},
    {"id": "res_ita", "label": "Itaipu", "type": "reservoir", "properties": {"capacity_mcm": 29000, "current_pct": 84}},
    {"id": "res_can", "label": "Cantareira System", "type": "reservoir", "properties": {"capacity_mcm": 982, "current_pct": 62}},
    # Rivers
    {"id": "riv_ganges", "label": "Ganges", "type": "river", "properties": {"length_km": 2525, "status": "warning"}},
    {"id": "riv_brahma", "label": "Brahmaputra", "type": "river", "properties": {"length_km": 2900, "status": "flood"}},
    {"id": "riv_yamuna", "label": "Yamuna", "type": "river", "properties": {"length_km": 1376, "status": "warning"}},
    {"id": "riv_colorado", "label": "Colorado", "type": "river", "properties": {"length_km": 2330, "status": "drought"}},
    {"id": "riv_amazon", "label": "Amazon", "type": "river", "properties": {"length_km": 6992, "status": "normal"}},
    # Sensors
    {"id": "sen_001", "label": "Mumbai Flow Sensor", "type": "sensor", "properties": {"type": "flow", "status": "online"}},
    {"id": "sen_002", "label": "Chennai Quality Probe", "type": "sensor", "properties": {"type": "quality", "status": "online"}},
    {"id": "sen_003", "label": "Delhi Yamuna Gauge", "type": "sensor", "properties": {"type": "level", "status": "online"}},
    {"id": "sen_004", "label": "LA Pressure Node", "type": "sensor", "properties": {"type": "pressure", "status": "online"}},
    {"id": "sen_005", "label": "Hoover Level Sensor", "type": "sensor", "properties": {"type": "level", "status": "online"}},
    {"id": "sen_006", "label": "Amazon Flow Gauge", "type": "sensor", "properties": {"type": "flow", "status": "online"}},
    # Agents
    {"id": "agt_decision", "label": "DecisionAgent", "type": "agent", "properties": {"status": "active", "confidence": 0.94}},
    {"id": "agt_flood", "label": "FloodAgent", "type": "agent", "properties": {"status": "active", "confidence": 0.91}},
    {"id": "agt_quality", "label": "WaterQualityAgent", "type": "agent", "properties": {"status": "active", "confidence": 0.97}},
    {"id": "agt_leak", "label": "LeakDetectionAgent", "type": "agent", "properties": {"status": "active", "confidence": 0.89}},
    {"id": "agt_rainfall", "label": "RainfallAgent", "type": "agent", "properties": {"status": "active", "confidence": 0.88}},
    {"id": "agt_reservoir", "label": "ReservoirAgent", "type": "agent", "properties": {"status": "active", "confidence": 0.92}},
    {"id": "agt_global", "label": "GlobalCoordinatorAgent", "type": "agent", "properties": {"status": "active", "confidence": 0.95}},
]

EDGES = [
    # Country → State
    {"source": "c_india", "target": "s_mh", "relationship": "CONTAINS"},
    {"source": "c_india", "target": "s_tn", "relationship": "CONTAINS"},
    {"source": "c_india", "target": "s_up", "relationship": "CONTAINS"},
    {"source": "c_usa", "target": "s_ca", "relationship": "CONTAINS"},
    {"source": "c_usa", "target": "s_tx", "relationship": "CONTAINS"},
    {"source": "c_brazil", "target": "s_am", "relationship": "CONTAINS"},
    {"source": "c_brazil", "target": "s_sp", "relationship": "CONTAINS"},
    # State → City
    {"source": "s_mh", "target": "city_mum", "relationship": "CONTAINS"},
    {"source": "s_tn", "target": "city_che", "relationship": "CONTAINS"},
    {"source": "s_up", "target": "city_del", "relationship": "CONTAINS"},
    {"source": "s_ca", "target": "city_lac", "relationship": "CONTAINS"},
    {"source": "s_tx", "target": "city_hou", "relationship": "CONTAINS"},
    {"source": "s_sp", "target": "city_sao", "relationship": "CONTAINS"},
    # Reservoirs → States / Cities
    {"source": "res_bhak", "target": "s_mh", "relationship": "FEEDS"},
    {"source": "res_shiv", "target": "city_mum", "relationship": "FEEDS"},
    {"source": "res_hoo", "target": "city_lac", "relationship": "FEEDS"},
    {"source": "res_ita", "target": "c_brazil", "relationship": "FEEDS"},
    {"source": "res_can", "target": "city_sao", "relationship": "FEEDS"},
    # Rivers → Reservoirs / Countries
    {"source": "riv_ganges", "target": "c_india", "relationship": "FEEDS"},
    {"source": "riv_brahma", "target": "c_india", "relationship": "FEEDS"},
    {"source": "riv_yamuna", "target": "city_del", "relationship": "FEEDS"},
    {"source": "riv_colorado", "target": "res_hoo", "relationship": "FEEDS"},
    {"source": "riv_amazon", "target": "c_brazil", "relationship": "FEEDS"},
    # Sensors → Cities / Rivers
    {"source": "sen_001", "target": "city_mum", "relationship": "MONITORS"},
    {"source": "sen_002", "target": "city_che", "relationship": "MONITORS"},
    {"source": "sen_003", "target": "riv_yamuna", "relationship": "MONITORS"},
    {"source": "sen_004", "target": "city_lac", "relationship": "MONITORS"},
    {"source": "sen_005", "target": "res_hoo", "relationship": "MONITORS"},
    {"source": "sen_006", "target": "riv_amazon", "relationship": "MONITORS"},
    # Agents → Countries / Rivers
    {"source": "agt_global", "target": "c_india", "relationship": "MANAGES"},
    {"source": "agt_global", "target": "c_usa", "relationship": "MANAGES"},
    {"source": "agt_global", "target": "c_brazil", "relationship": "MANAGES"},
    {"source": "agt_flood", "target": "riv_brahma", "relationship": "MANAGES"},
    {"source": "agt_flood", "target": "riv_ganges", "relationship": "MANAGES"},
    {"source": "agt_reservoir", "target": "res_hoo", "relationship": "MANAGES"},
    {"source": "agt_reservoir", "target": "res_bhak", "relationship": "MANAGES"},
    {"source": "agt_quality", "target": "city_che", "relationship": "MANAGES"},
    {"source": "agt_quality", "target": "city_del", "relationship": "MANAGES"},
    {"source": "agt_leak", "target": "city_mum", "relationship": "MANAGES"},
    {"source": "agt_rainfall", "target": "riv_brahma", "relationship": "MANAGES"},
    # Agent → Agent delegation
    {"source": "agt_global", "target": "agt_decision", "relationship": "DELEGATES"},
    {"source": "agt_decision", "target": "agt_flood", "relationship": "DELEGATES"},
    {"source": "agt_decision", "target": "agt_quality", "relationship": "DELEGATES"},
    {"source": "agt_decision", "target": "agt_reservoir", "relationship": "DELEGATES"},
    {"source": "agt_flood", "target": "agt_rainfall", "relationship": "DELEGATES"},
    # Alerts
    {"source": "agt_flood", "target": "city_del", "relationship": "ALERTS"},
    {"source": "agt_quality", "target": "city_che", "relationship": "ALERTS"},
    {"source": "agt_leak", "target": "city_mum", "relationship": "ALERTS"},
]


@router.get("")
async def get_knowledge_graph():
    return {
        "nodes": NODES,
        "edges": EDGES,
        "stats": {
            "total_nodes": len(NODES),
            "total_edges": len(EDGES),
            "node_types": {"country": 3, "state": 7, "city": 6, "reservoir": 5, "river": 5, "sensor": 6, "agent": 7},
        },
        "ai_insights": {
            "confidence_score": 0.96,
            "reasoning_summary": "Knowledge graph constructed from live entity relationships across 3 countries, 7 states, 6 cities.",
            "participating_agents": ["GlobalCoordinatorAgent", "DecisionAgent"],
            "tools_used": ["searchKnowledge"],
        },
    }
