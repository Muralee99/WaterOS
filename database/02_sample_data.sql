-- =============================================================================
-- WaterOS Sample Data
-- Realistic water intelligence data matching agent context dictionaries.
-- Safe to run multiple times — uses ON CONFLICT DO NOTHING.
-- =============================================================================

-- Stable UUIDs for cross-table references
-- Reservoirs:  a0000001-... to a000000f-...
-- Rivers:      b0000001-... to b000000a-...
-- Water Quality: c0000001-... to c0000006-...
-- Groundwater: d0000001-... to d0000004-...
-- Sensors:     e0000001-... to e000001e-...
-- Alerts:      f0000001-... to f0000008-...
-- Weather:     g0000001-... to g0000006-...
-- Users:       u0000001-... to u0000003-...

-- =============================================================================
-- ROLES & USERS
-- =============================================================================
INSERT INTO roles (id, name, description, permissions) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin',    'Platform administrator',   '["*"]'),
    ('00000000-0000-0000-0000-000000000002', 'operator', 'Field operator',            '["read","alerts:ack","agents:run"]'),
    ('00000000-0000-0000-0000-000000000003', 'analyst',  'Data analyst (read-only)',  '["read"]')
ON CONFLICT DO NOTHING;

-- Password hash for "wateros2025!" (bcrypt, for demo only)
INSERT INTO users (id, email, username, hashed_password, full_name, is_active, is_superuser, api_key) VALUES
    ('00000000-0000-0000-0001-000000000001',
     'admin@wateros.ai', 'admin',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtnxM2d3L1fLNE7Zk3K5PjGzc5Ti',
     'WaterOS Admin', TRUE, TRUE, 'wos-admin-key-2025-hackathon'),
    ('00000000-0000-0000-0001-000000000002',
     'operator@wateros.ai', 'operator1',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtnxM2d3L1fLNE7Zk3K5PjGzc5Ti',
     'Field Operator', TRUE, FALSE, 'wos-op1-key-2025-hackathon'),
    ('00000000-0000-0000-0001-000000000003',
     'analyst@wateros.ai', 'analyst1',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtnxM2d3L1fLNE7Zk3K5PjGzc5Ti',
     'Data Analyst', TRUE, FALSE, 'wos-analyst-key-2025-hackathon')
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES
    ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000002'),
    ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- RESERVOIRS  (matches reservoir_agent.py _RESERVOIR_CONTEXTS)
-- =============================================================================
INSERT INTO reservoirs
    (id, name, country, state, city, location, latitude, longitude,
     capacity_mcm, current_level_mcm, inflow_rate, outflow_rate,
     spillway_level, dead_storage, metadata)
VALUES
-- India
('a0000000-0000-0000-0000-000000000001',
 'Tansa–Vaitarna Reservoir Complex',
 'India', 'Maharashtra', 'Mumbai',
 'Tansa, Maharashtra, India', 19.80, 73.41,
 168.0, 153.2,   -- 91.2%
 382.0, 248.0, 170.0, 8.0,
 '{"operator":"MCGM","purpose":["drinking_water"],"commissioned":1892}'),

('a0000000-0000-0000-0000-000000000002',
 'Hirakud Reservoir',
 'India', 'Odisha', '',
 'Sambalpur, Odisha, India', 21.53, 83.87,
 8136.0, 7420.0,   -- 91.2%
 480.0, 320.0, 192.0, 447.0,
 '{"operator":"OHPC","purpose":["flood_control","irrigation","hydro"],"river":"Mahanadi","commissioned":1957}'),

('a0000000-0000-0000-0000-000000000003',
 'Bisalpur Dam',
 'India', 'Rajasthan', '',
 'Tonk, Rajasthan, India', 25.90, 75.73,
 1086.0, 448.5,   -- 41.3%
 28.0, 35.0, 315.5, 30.0,
 '{"operator":"RWSSMB","purpose":["drinking_water","irrigation"],"river":"Banas","commissioned":1999}'),

('a0000000-0000-0000-0000-000000000004',
 'Kopili Hydroelectric Reservoir',
 'India', 'Assam', '',
 'Karbi Anglong, Assam, India', 25.95, 93.42,
 402.0, 351.3,   -- 87.4%
 622.0, 290.0, 405.0, 20.0,
 '{"operator":"NEEPCO","purpose":["hydro"],"river":"Kopili","commissioned":1976}'),

('a0000000-0000-0000-0000-000000000005',
 'Bhakra–Nangal Reservoir (Gobind Sagar)',
 'India', 'Himachal Pradesh', '',
 'Bilaspur, Himachal Pradesh, India', 31.42, 76.46,
 7501.0, 5115.7,   -- 68.2%
 210.0, 185.0, 514.0, 938.0,
 '{"operator":"BBMB","purpose":["irrigation","hydro","drinking_water"],"river":"Sutlej","commissioned":1963}'),

('a0000000-0000-0000-0000-000000000006',
 'Khadakwasla Reservoir',
 'India', 'Maharashtra', 'Pune',
 'Pune, Maharashtra, India', 18.43, 73.76,
 35.0, 31.0,   -- 88.6%
 156.0, 98.0, 36.2, 2.5,
 '{"operator":"MWRRA","purpose":["drinking_water","irrigation"],"river":"Mutha","commissioned":1879}'),

-- China
('a0000000-0000-0000-0000-000000000007',
 'Three Gorges Reservoir',
 'China', 'Hubei', '',
 'Yichang, Hubei, China', 30.82, 111.00,
 39300.0, 35016.3,   -- 89.1%
 30150.0, 22000.0, 175.0, 5000.0,
 '{"operator":"CTGC","purpose":["flood_control","hydro","navigation"],"river":"Yangtze","commissioned":2003}'),

-- USA
('a0000000-0000-0000-0000-000000000008',
 'Shasta Lake',
 'United States', 'California', '',
 'Redding, California, USA', 40.72, -122.41,
 4552.0, 2462.6,   -- 54.1%
 310.0, 290.0, 330.0, 245.0,
 '{"operator":"USBR","purpose":["irrigation","drinking_water","hydro","flood_control"],"river":"Sacramento","commissioned":1945}'),

('a0000000-0000-0000-0000-000000000009',
 'Lake Mead (Hoover Dam)',
 'United States', 'Nevada', '',
 'Boulder City, Nevada, USA', 36.01, -114.74,
 36703.0, 13947.1,   -- 38%
 850.0, 1020.0, 480.0, 4400.0,
 '{"operator":"USBR","purpose":["hydro","irrigation","drinking_water"],"river":"Colorado","commissioned":1935}'),

-- Australia
('a0000000-0000-0000-0000-00000000000a',
 'Lake Wivenhoe',
 'Australia', 'Queensland', '',
 'Somerset, Queensland, Australia', -27.39, 152.61,
 1165.0, 214.4,   -- 18.4%
 12.0, 22.0, 67.0, 30.0,
 '{"operator":"Seqwater","purpose":["drinking_water","flood_mitigation"],"river":"Brisbane","commissioned":1984}'),

-- Egypt
('a0000000-0000-0000-0000-00000000000b',
 'Aswan High Dam Reservoir (Lake Nasser)',
 'Egypt', '', '',
 'Aswan, Egypt', 23.97, 32.88,
 132000.0, 90288.0,   -- 68.4%
 2830.0, 2600.0, 183.0, 30000.0,
 '{"operator":"MWRI","purpose":["hydro","irrigation","flood_control"],"river":"Nile","commissioned":1970}'),

-- Brazil
('a0000000-0000-0000-0000-00000000000c',
 'Itaipu Reservoir',
 'Brazil', 'Paraná', '',
 'Foz do Iguaçu, Paraná, Brazil', -25.41, -54.59,
 29000.0, 22707.0,   -- 78.3%
 8500.0, 7200.0, 220.0, 656.0,
 '{"operator":"Itaipu_Binacional","purpose":["hydro"],"river":"Paraná","commissioned":1984}'),

-- Germany (Rhine)
('a0000000-0000-0000-0000-00000000000d',
 'Rappbode Reservoir',
 'Germany', 'Saxony-Anhalt', '',
 'Oberharz, Saxony-Anhalt, Germany', 51.74, 10.86,
 109.0, 93.2,   -- 85.5%
 18.0, 12.0, 415.0, 5.5,
 '{"operator":"Talsperrenbetrieb_Sachsen","purpose":["drinking_water","flood_protection"],"river":"Rappbode","commissioned":1959}'),

-- Japan
('a0000000-0000-0000-0000-00000000000e',
 'Lake Okutama (Ogochi Dam)',
 'Japan', 'Tokyo', '',
 'Okutama, Tokyo, Japan', 35.78, 139.09,
 185.0, 156.0,   -- 84.3%
 32.0, 24.0, 598.0, 10.0,
 '{"operator":"Tokyo_Metropolitan_Government","purpose":["drinking_water"],"river":"Tama","commissioned":1957}'),

-- Canada
('a0000000-0000-0000-0000-00000000000f',
 'Gardiner Dam (Lake Diefenbaker)',
 'Canada', 'Saskatchewan', '',
 'Riverhurst, Saskatchewan, Canada', 51.08, -106.52,
 9400.0, 8554.0,   -- 91.0%
 145.0, 110.0, 390.0, 1360.0,
 '{"operator":"Saskatchewan_WS","purpose":["irrigation","hydro","drinking_water"],"river":"Saskatchewan","commissioned":1967}')

ON CONFLICT DO NOTHING;

-- =============================================================================
-- RIVERS  (matches flood_agent.py _RIVER_CONTEXTS)
-- =============================================================================
INSERT INTO rivers
    (id, name, country, state, basin, length_km,
     current_level_m, normal_level_m, flood_level_m,
     discharge_m3s, discharge_cumecs, flow_velocity,
     flood_risk, basin_area_km2, ecosystem_health,
     latitude, longitude)
VALUES
('b0000000-0000-0000-0000-000000000001',
 'Brahmaputra', 'India', 'Assam',
 'Brahmaputra', 2900.0,
 7.2, 4.5, 6.0,          -- current 7.2m — CRITICAL (1.2m above 6.0 threshold)
 42000.0, 42000.0, 1.8,
 'critical', 651334.0, 72.0,
 26.18, 91.77),

('b0000000-0000-0000-0000-000000000002',
 'Godavari', 'India', 'Maharashtra',
 'Godavari', 1465.0,
 5.4, 3.2, 5.0,          -- current 5.4m — HIGH (0.4m above threshold)
 3520.0, 3520.0, 1.2,
 'high', 312812.0, 65.0,
 19.88, 73.76),

('b0000000-0000-0000-0000-000000000003',
 'Buriganga', 'Bangladesh', 'Dhaka Division',
 'Ganges-Brahmaputra', 30.0,
 6.8, 4.0, 5.5,          -- current 6.8m — HIGH (1.3m above threshold)
 1200.0, 1200.0, 0.8,
 'high', 8400.0, 28.0,   -- low ecosystem health (industrial pollution)
 23.72, 90.36),

('b0000000-0000-0000-0000-000000000004',
 'Yamuna', 'India', 'Delhi',
 'Ganges', 1376.0,
 3.2, 2.8, 5.0,
 2980.0, 2980.0, 0.9,
 'medium', 366223.0, 35.0,
 28.62, 77.21),

('b0000000-0000-0000-0000-000000000005',
 'Ganga (Ganges)', 'India', 'Uttar Pradesh',
 'Ganges', 2525.0,
 8.1, 7.0, 7.5,
 11000.0, 11000.0, 1.1,
 'medium', 907000.0, 55.0,
 25.60, 83.01),

('b0000000-0000-0000-0000-000000000006',
 'Murray River', 'Australia', 'New South Wales',
 'Murray-Darling', 2508.0,
 1.8, 3.2, 4.0,
 280.0, 280.0, 0.3,
 'low', 1061469.0, 58.0,
 -34.17, 142.16),

('b0000000-0000-0000-0000-000000000007',
 'Rhine', 'Germany', 'North Rhine-Westphalia',
 'Rhine', 1230.0,
 2.4, 2.8, 4.0,
 2200.0, 2200.0, 0.7,
 'low', 198735.0, 82.0,
 51.92, 6.89),

('b0000000-0000-0000-0000-000000000008',
 'Amazon', 'Brazil', 'Amazonas',
 'Amazon', 6992.0,
 24.5, 22.0, 28.0,
 209000.0, 209000.0, 2.1,
 'medium', 7000000.0, 94.0,
 -3.47, -60.30),

('b0000000-0000-0000-0000-000000000009',
 'Yangtze', 'China', 'Hubei',
 'Yangtze', 6300.0,
 38.4, 36.0, 40.0,
 30150.0, 30150.0, 1.5,
 'medium', 1800000.0, 60.0,
 30.62, 114.31),

('b0000000-0000-0000-0000-00000000000a',
 'Nile', 'Egypt', 'Aswan',
 'Nile', 6650.0,
 15.2, 14.0, 18.0,
 2830.0, 2830.0, 0.5,
 'low', 3349000.0, 48.0,
 23.97, 32.88)

ON CONFLICT DO NOTHING;

-- =============================================================================
-- WATER QUALITY  (matches water_quality_agent.py _CITY_WQ)
-- =============================================================================
INSERT INTO water_quality
    (id, location, country, city, latitude, longitude,
     ph, turbidity_ntu, chlorine_mg_l, dissolved_oxygen,
     conductivity, temperature_c, heavy_metals,
     safety_score, status, sampling_zone, population_at_risk)
VALUES
('c0000000-0000-0000-0000-000000000001',
 'Bhandup Water Treatment Plant, Mumbai', 'India', 'Mumbai',
 19.14, 72.95,
 7.4, 6.8, 0.8, 7.2,
 320.0, 28.5,
 '{"lead_ppb":4.2,"arsenic_ppb":1.8,"mercury_ppb":0.1}',
 66.7, 'warning',
 'Zone 7 – Bhandup WTP service area (monsoon turbidity surge)',
 '1.2M residents in eastern suburbs'),

('c0000000-0000-0000-0000-000000000002',
 'Yamuna Basin WTP, Delhi', 'India', 'Delhi',
 28.68, 77.22,
 7.8, 12.4, 0.4, 5.6,
 480.0, 30.2,
 '{"lead_ppb":8.6,"arsenic_ppb":3.2,"mercury_ppb":0.3}',
 50.0, 'warning',
 'Yamuna basin WTP – monsoon runoff contamination',
 '4.8M in downstream distribution zones'),

('c0000000-0000-0000-0000-000000000003',
 'Buriganga River Intake, Dhaka', 'Bangladesh', 'Dhaka',
 23.72, 90.36,
 6.9, 18.2, 0.12, 4.8,
 720.0, 31.8,
 '{"lead_ppb":12.4,"arsenic_ppb":8.9,"mercury_ppb":0.8}',
 16.7, 'danger',
 'Buriganga River intake – critical industrial contamination',
 '8.9M Dhaka metro residents'),

('c0000000-0000-0000-0000-000000000004',
 'Nile Delta Intake, Cairo', 'Egypt', 'Cairo',
 30.07, 31.23,
 8.1, 3.2, 0.6, 7.8,
 280.0, 24.1,
 '{"lead_ppb":5.1,"arsenic_ppb":2.4,"mercury_ppb":0.2}',
 83.3, 'safe',
 'Nile delta intake – agricultural runoff concern',
 '2.1M in eastern districts'),

('c0000000-0000-0000-0000-000000000005',
 'Ciliwung River WTP, Jakarta', 'Indonesia', 'Jakarta',
 -6.21, 106.85,
 6.8, 8.9, 0.3, 5.2,
 540.0, 29.8,
 '{"lead_ppb":9.8,"arsenic_ppb":4.6,"mercury_ppb":0.5}',
 50.0, 'warning',
 'Ciliwung River catchment – industrial discharge',
 '5.6M in central Jakarta'),

('c0000000-0000-0000-0000-000000000006',
 'Nairobi River Sampling Point, Nairobi', 'Kenya', 'Nairobi',
 -1.29, 36.82,
 7.1, 5.8, 0.25, 6.4,
 360.0, 22.3,
 '{"lead_ppb":6.8,"arsenic_ppb":2.1,"mercury_ppb":0.2}',
 66.7, 'warning',
 'Nairobi River – urban stormwater contamination',
 '900K in Eastlands districts')

ON CONFLICT DO NOTHING;

-- =============================================================================
-- GROUNDWATER  (matches decision_agent.py mock responses)
-- =============================================================================
INSERT INTO groundwater
    (id, location, country, state, latitude, longitude,
     depth_m, level_m, recharge_rate, extraction_rate,
     quality_score, depletion_risk)
VALUES
('d0000000-0000-0000-0000-000000000001',
 'Rajasthan Aquifer System', 'India', 'Rajasthan',
 26.92, 75.78,
 42.0, 358.0, 120.0, 480.0,
 68.0, 'critical'),

('d0000000-0000-0000-0000-000000000002',
 'NW India Indo-Gangetic Aquifer', 'India', 'Punjab',
 30.90, 75.85,
 28.0, 212.0, 280.0, 520.0,
 74.0, 'high'),

('d0000000-0000-0000-0000-000000000003',
 'California Central Valley Aquifer', 'United States', 'California',
 36.78, -119.42,
 35.0, 65.0, 150.0, 480.0,
 82.0, 'high'),

('d0000000-0000-0000-0000-000000000004',
 'Arabian Aquifer System', 'Saudi Arabia', 'Riyadh',
 24.69, 46.72,
 65.0, 435.0, 8.0, 620.0,  -- non-renewable: ~zero recharge
 71.0, 'critical')

ON CONFLICT DO NOTHING;

-- =============================================================================
-- SENSORS  (pressure, flow, water-level, quality probes)
-- =============================================================================
INSERT INTO sensors
    (id, name, sensor_type, location, country,
     latitude, longitude, current_value, unit,
     min_threshold, max_threshold, battery_level,
     last_reading, metadata)
VALUES
-- Brahmaputra river level sensors
('e0000000-0000-0000-0000-000000000001',
 'Brahmaputra Level Gauge – Guwahati', 'water_level',
 'Guwahati, Assam, India', 'India',
 26.18, 91.77, 7.2, 'm',
 0.0, 6.0, 88.0, NOW() - INTERVAL '2 minutes',
 '{"river":"Brahmaputra","gauge_id":"BWO-GHY-01","flood_threshold_m":6.0}'),

('e0000000-0000-0000-0000-000000000002',
 'Brahmaputra Flow Gauge – Tezpur', 'flow_rate',
 'Tezpur, Assam, India', 'India',
 26.63, 92.80, 42000.0, 'm3/s',
 5000.0, 60000.0, 92.0, NOW() - INTERVAL '5 minutes',
 '{"river":"Brahmaputra","gauge_id":"BWO-TEZ-01"}'),

-- Mumbai pipeline pressure sensors
('e0000000-0000-0000-0000-000000000003',
 'Dharavi Trunk Main Inlet Pressure', 'pressure',
 'Dharavi, Mumbai, India', 'India',
 19.04, 72.85, 5.8, 'bar',
 3.0, 8.0, 76.0, NOW() - INTERVAL '1 minute',
 '{"pipeline_id":"MUM-ZONE7-DN600","segment":"inlet","pipe_age_yr":57}'),

('e0000000-0000-0000-0000-000000000004',
 'Dharavi Trunk Main Outlet Pressure', 'pressure',
 'Kurla, Mumbai, India', 'India',
 19.07, 72.88, 3.4, 'bar',
 3.0, 8.0, 81.0, NOW() - INTERVAL '1 minute',
 '{"pipeline_id":"MUM-ZONE7-DN600","segment":"outlet","expected_bar":5.8}'),

('e0000000-0000-0000-0000-000000000005',
 'Bhandup WTP Flow Meter', 'flow_rate',
 'Bhandup, Mumbai, India', 'India',
 19.14, 72.95, 3800.0, 'MLD',
 0.0, 4500.0, 95.0, NOW() - INTERVAL '30 seconds',
 '{"pipeline_id":"MUM-ZONE7-DN600","segment":"WTP_outlet","wtp":"Bhandup"}'),

-- Delhi pressure sensors
('e0000000-0000-0000-0000-000000000006',
 'Yamuna Vihar Zone Inlet Pressure', 'pressure',
 'Yamuna Vihar, Delhi, India', 'India',
 28.70, 77.28, 6.2, 'bar',
 3.0, 8.0, 68.0, NOW() - INTERVAL '3 minutes',
 '{"pipeline_id":"DEL-ZONE3-DN450","segment":"inlet"}'),

('e0000000-0000-0000-0000-000000000007',
 'Yamuna Vihar Zone Outlet Pressure', 'pressure',
 'Yamuna Vihar, Delhi, India', 'India',
 28.70, 77.28, 3.8, 'bar',
 3.0, 8.0, 72.0, NOW() - INTERVAL '3 minutes',
 '{"pipeline_id":"DEL-ZONE3-DN450","segment":"outlet"}'),

-- Godavari water level sensor
('e0000000-0000-0000-0000-000000000008',
 'Godavari Level Gauge – Nashik', 'water_level',
 'Nashik, Maharashtra, India', 'India',
 19.99, 73.79, 5.4, 'm',
 0.0, 5.0, 91.0, NOW() - INTERVAL '10 minutes',
 '{"river":"Godavari","gauge_id":"GD-NSK-01","flood_threshold_m":5.0}'),

-- Buriganga water level sensor
('e0000000-0000-0000-0000-000000000009',
 'Buriganga Level Gauge – Sadarghat', 'water_level',
 'Dhaka, Bangladesh', 'Bangladesh',
 23.72, 90.39, 6.8, 'm',
 0.0, 5.5, 85.0, NOW() - INTERVAL '5 minutes',
 '{"river":"Buriganga","gauge_id":"BWDB-BUR-01","flood_threshold_m":5.5}'),

-- Hirakud reservoir sensors
('e0000000-0000-0000-0000-00000000000a',
 'Hirakud Reservoir Level Sensor', 'water_level',
 'Sambalpur, Odisha, India', 'India',
 21.53, 83.87, 192.0, 'm',  -- current elevation in metres above MSL
 160.0, 192.0, 97.0, NOW() - INTERVAL '15 minutes',
 '{"reservoir_id":"a0000000-0000-0000-0000-000000000002","type":"reservoir_level"}'),

('e0000000-0000-0000-0000-00000000000b',
 'Hirakud Spillway Flow Meter', 'flow_rate',
 'Sambalpur, Odisha, India', 'India',
 21.53, 83.87, 480.0, 'm3/s',
 0.0, 1000.0, 93.0, NOW() - INTERVAL '15 minutes',
 '{"reservoir_id":"a0000000-0000-0000-0000-000000000002","type":"spillway_outflow"}'),

-- Three Gorges sensors
('e0000000-0000-0000-0000-00000000000c',
 'Three Gorges Level Sensor', 'water_level',
 'Yichang, Hubei, China', 'China',
 30.82, 111.00, 174.5, 'm',
 140.0, 175.0, 99.0, NOW() - INTERVAL '1 minute',
 '{"reservoir_id":"a0000000-0000-0000-0000-000000000007","type":"reservoir_level","max_normal_m":175}'),

-- Shasta Lake sensor
('e0000000-0000-0000-0000-00000000000d',
 'Shasta Lake Level Sensor', 'water_level',
 'Redding, California, USA', 'United States',
 40.72, -122.41, 297.0, 'ft',
 0.0, 1067.0, 88.0, NOW() - INTERVAL '20 minutes',
 '{"reservoir_id":"a0000000-0000-0000-0000-000000000008","type":"reservoir_level"}'),

-- Lake Wivenhoe sensor
('e0000000-0000-0000-0000-00000000000e',
 'Lake Wivenhoe Level Sensor', 'water_level',
 'Somerset, Queensland, Australia', 'Australia',
 -27.39, 152.61, 61.2, 'm',
 0.0, 67.0, 82.0, NOW() - INTERVAL '30 minutes',
 '{"reservoir_id":"a0000000-0000-0000-0000-00000000000a","type":"reservoir_level"}'),

-- Water quality probes
('e0000000-0000-0000-0000-00000000000f',
 'Bhandup WTP pH Probe', 'ph',
 'Bhandup, Mumbai, India', 'India',
 19.14, 72.95, 7.4, 'pH',
 6.5, 8.5, 90.0, NOW() - INTERVAL '5 minutes',
 '{"wq_location_id":"c0000000-0000-0000-0000-000000000001","wtp":"Bhandup"}'),

('e0000000-0000-0000-0000-000000000010',
 'Bhandup WTP Turbidity Sensor', 'turbidity',
 'Bhandup, Mumbai, India', 'India',
 19.14, 72.95, 6.8, 'NTU',
 0.0, 4.0, 87.0, NOW() - INTERVAL '5 minutes',
 '{"wq_location_id":"c0000000-0000-0000-0000-000000000001","wtp":"Bhandup","who_limit_ntu":4.0}'),

('e0000000-0000-0000-0000-000000000011',
 'Yamuna WTP Turbidity Sensor', 'turbidity',
 'Wazirabad WTP, Delhi, India', 'India',
 28.73, 77.22, 12.4, 'NTU',
 0.0, 4.0, 74.0, NOW() - INTERVAL '8 minutes',
 '{"wq_location_id":"c0000000-0000-0000-0000-000000000002","wtp":"Wazirabad"}'),

('e0000000-0000-0000-0000-000000000012',
 'Buriganga Chlorine Sensor', 'chlorine',
 'Dhaka WASA WTP, Bangladesh', 'Bangladesh',
 23.74, 90.37, 0.12, 'mg/L',
 0.2, 2.0, 61.0, NOW() - INTERVAL '12 minutes',
 '{"wq_location_id":"c0000000-0000-0000-0000-000000000003","wtp":"DhakaWASA"}'),

-- Rajasthan groundwater piezometer
('e0000000-0000-0000-0000-000000000013',
 'Rajasthan Aquifer Piezometer RJ-01', 'water_level',
 'Jaipur, Rajasthan, India', 'India',
 26.92, 75.78, -42.0, 'm',
 -100.0, 0.0, 68.0, NOW() - INTERVAL '1 hour',
 '{"gw_id":"d0000000-0000-0000-0000-000000000001","type":"piezometer","critical_depth_m":-50}'),

-- Murray River sensor
('e0000000-0000-0000-0000-000000000014',
 'Murray River Level Gauge – Wentworth', 'water_level',
 'Wentworth, NSW, Australia', 'Australia',
 -34.11, 141.91, 1.8, 'm',
 0.0, 4.0, 95.0, NOW() - INTERVAL '30 minutes',
 '{"river":"Murray","gauge_id":"MDB-WEN-01"}')

ON CONFLICT DO NOTHING;

-- =============================================================================
-- ALERTS  (active alerts matching agent outputs)
-- =============================================================================
INSERT INTO alerts
    (id, alert_type, severity, title, message, location, country,
     latitude, longitude, is_active, confidence,
     evidence, recommended_actions, expires_at)
VALUES
('f0000000-0000-0000-0000-000000000001',
 'flood', 'critical',
 'CRITICAL FLOOD ALERT: Brahmaputra River, Assam',
 'Brahmaputra River at Guwahati–Saraighat gauge has reached 7.2m — 1.2m above the 6.0m flood threshold. Flood crest expected in 6 hours. 240,000 people in 4 districts under evacuation advisory.',
 'Guwahati, Assam, India', 'India',
 26.18, 91.77, TRUE, 0.94,
 '{"river":"Brahmaputra","current_level_m":7.2,"flood_threshold_m":6.0,"storm_probability_pct":78,"districts_affected":["Kamrup","Barpeta","Morigaon","Nagaon"],"hours_to_crest":6}',
 '["Activate NDRF and SDRF teams immediately","Issue evacuation order for low-lying areas in 4 districts","Pre-position rescue boats at Guwahati, Tezpur, Jorhat","Open all Kopili reservoir spillways to manage inflow","Broadcast emergency alert via All India Radio and SMS"]',
 NOW() + INTERVAL '48 hours'),

('f0000000-0000-0000-0000-000000000002',
 'flood', 'high',
 'HIGH FLOOD RISK: Buriganga River, Dhaka',
 'Buriganga River at Sadarghat gauge has reached 6.8m — 1.3m above the 5.5m flood threshold. 890,000 residents in 3 districts at risk. Storm probability 84% over 48 hours.',
 'Dhaka, Bangladesh', 'Bangladesh',
 23.72, 90.39, TRUE, 0.91,
 '{"river":"Buriganga","current_level_m":6.8,"flood_threshold_m":5.5,"storm_probability_pct":84,"districts":["Dhaka","Narayanganj","Munshiganj"],"population_at_risk":890000}',
 '["Deploy 120 BIWTA rescue boats","Activate Dhaka City Corporation flood EOC","Issue flash flood warning for Narayanganj and Munshiganj","Begin voluntary evacuation of river-adjacent low-income settlements","Alert medical emergency services"]',
 NOW() + INTERVAL '72 hours'),

('f0000000-0000-0000-0000-000000000003',
 'flood', 'high',
 'HIGH FLOOD RISK: Godavari River, Nashik',
 'Godavari at Nashik–Gangapur gauge is at 5.4m — 0.4m above the 5.0m flood threshold. 85,000 people in Nashik, Nandurbar, and Dhule districts at risk.',
 'Nashik, Maharashtra, India', 'India',
 19.99, 73.79, TRUE, 0.88,
 '{"river":"Godavari","current_level_m":5.4,"flood_threshold_m":5.0,"storm_probability_pct":62,"districts":["Nashik","Nandurbar","Dhule"],"population_at_risk":85000}',
 '["Pre-position 22 SDRF boats in Nashik and Dhule","Issue flood watch for downstream Godavari communities","Reduce Gangapur Dam release to 120 m3/s","Alert hospitals in Nashik for potential casualties","Coordinate with Telangana for downstream flood advisory"]',
 NOW() + INTERVAL '36 hours'),

('f0000000-0000-0000-0000-000000000004',
 'leak', 'high',
 'PIPELINE LEAK: Zone 7 Dharavi–Kurla Trunk Main, Mumbai',
 'Pressure differential of 2.4 bar detected on Dharavi–Kurla DN600 cast-iron trunk main (1968 vintage). Estimated flow loss: 22.3% (4,130 m³/day). Economic impact: ₹2.1M/month.',
 'Dharavi, Mumbai, India', 'India',
 19.04, 72.85, TRUE, 0.89,
 '{"pipeline_id":"MUM-ZONE7-DN600","inlet_pressure_bar":5.8,"outlet_pressure_bar":3.4,"pressure_drop_bar":2.4,"flow_loss_pct":22.3,"daily_loss_m3":4130,"economic_impact_inr_month":2100000}',
 '["Deploy MCGM leak detection crew to Dharavi sector","Isolate segment between Manhole J-14 and J-22","Activate Zone 7 bypass feed from Thane WTP","Schedule emergency pipe repair within 6 hours","Notify affected residents via MCGM alert system"]',
 NOW() + INTERVAL '24 hours'),

('f0000000-0000-0000-0000-000000000005',
 'quality', 'critical',
 'WATER QUALITY DANGER: Dhaka Buriganga Intake',
 'Buriganga River intake shows 3 WHO violations: turbidity 18.2 NTU (limit 4.0), chlorine 0.12 mg/L (below 0.2 minimum), dissolved oxygen 4.8 mg/L (below 6.0). Safety score: 17%. 8.9M residents at risk.',
 'Dhaka, Bangladesh', 'Bangladesh',
 23.72, 90.36, TRUE, 0.96,
 '{"turbidity_ntu":18.2,"chlorine_mg_l":0.12,"dissolved_oxygen_mg_l":4.8,"lead_ppb":12.4,"arsenic_ppb":8.9,"safety_score":16.7,"who_violations":3}',
 '["Issue mandatory boil-water advisory for all Dhaka WASA supply zones","Emergency chlorination: increase dose to 3.0 mg/L","Activate alternative groundwater supply sources","Deploy 500 emergency water distribution points","Notify WHO Bangladesh office and MoHFW"]',
 NOW() + INTERVAL '72 hours'),

('f0000000-0000-0000-0000-000000000006',
 'quality', 'warning',
 'TURBIDITY WARNING: Bhandup WTP, Mumbai',
 'Zone 7 Bhandup WTP shows turbidity at 6.8 NTU — 70% above the 4.0 NTU WHO limit due to monsoon runoff. Boil-water advisory issued for 2 eastern wards.',
 'Bhandup, Mumbai, India', 'India',
 19.14, 72.95, TRUE, 0.87,
 '{"turbidity_ntu":6.8,"who_limit_ntu":4.0,"chlorine_mg_l":0.8,"ph":7.4,"safety_score":66.7,"wards_affected":2}',
 '["Increase coagulant (alum) dosing at Bhandup WTP by 25%","Issue boil-water advisory for Mulund East and Kanjurmarg wards","Increase WTP monitoring frequency to 2-hourly","Inspect pre-sedimentation tanks for overflow","Alert MCGM water quality control cell"]',
 NOW() + INTERVAL '24 hours'),

('f0000000-0000-0000-0000-000000000007',
 'drought', 'high',
 'DROUGHT ALERT: Bisalpur Dam Critically Low, Rajasthan',
 'Bisalpur Dam is at 41.3% capacity (448.5 MCM of 1086 MCM). Rainfall deficit 38% below 30-year average. Water rationing enforced in 12 districts; supply crisis for Jaipur (3.1M people).',
 'Tonk, Rajasthan, India', 'India',
 25.90, 75.73, TRUE, 0.92,
 '{"reservoir":"Bisalpur","fill_pct":41.3,"rainfall_deficit_pct":38,"districts_rationing":12,"groundwater_depth_m":42}',
 '["Enforce Stage 3 water rationing across Jaipur and Tonk districts","Deploy 847 emergency water tankers to rural villages","Activate MNREGA drought relief employment scheme","Issue drought declaration to National Disaster Management Authority","Expedite Chambal–Bisalpur link canal emergency works"]',
 NOW() + INTERVAL '30 days'),

('f0000000-0000-0000-0000-000000000008',
 'flood', 'high',
 'RESERVOIR OVERFLOW RISK: Hirakud, Odisha',
 'Hirakud Reservoir is at 91.2% capacity (7,420 MCM of 8,136 MCM). Inflow 480 m³/s vs outflow 320 m³/s — net surplus 160 m³/s. Overflow risk HIGH if monsoon continues.',
 'Sambalpur, Odisha, India', 'India',
 21.53, 83.87, TRUE, 0.90,
 '{"reservoir":"Hirakud","fill_pct":91.2,"inflow_m3s":480,"outflow_m3s":320,"net_surplus_m3s":160}',
 '["Increase controlled release to 480 m3/s immediately","Issue downstream flood warning for Sambalpur and Bargarh","Pre-position ODRAF teams at Mundali Barrage","Coordinate with Mahanadi Basin Authority on release schedule","Alert Paradip Port Trust for elevated Mahanadi flow"]',
 NOW() + INTERVAL '48 hours')

ON CONFLICT DO NOTHING;

-- =============================================================================
-- WEATHER  (real-world-matched values for key locations)
-- =============================================================================
INSERT INTO weather
    (id, location, country, latitude, longitude,
     temperature_c, humidity_pct, rainfall_mm,
     wind_speed_kmh, pressure_hpa, cloud_cover_pct,
     visibility_km, uv_index, forecast)
VALUES
('77000000-0000-0000-0000-000000000001',
 'Mumbai, Maharashtra', 'India',
 19.08, 72.88,
 32.9, 84.0, 28.4,
 22.0, 1006.0, 90.0, 5.2, 4.0,
 '[{"day":1,"date":"2026-06-22","rainfall_mm":28.4,"temp_max_c":33.1,"temp_min_c":27.8},{"day":2,"date":"2026-06-23","rainfall_mm":42.8,"temp_max_c":31.8,"temp_min_c":27.2},{"day":3,"date":"2026-06-24","rainfall_mm":68.2,"temp_max_c":30.5,"temp_min_c":26.9},{"day":4,"date":"2026-06-25","rainfall_mm":18.0,"temp_max_c":32.4,"temp_min_c":27.5},{"day":5,"date":"2026-06-26","rainfall_mm":8.2,"temp_max_c":33.8,"temp_min_c":28.1},{"day":6,"date":"2026-06-27","rainfall_mm":35.6,"temp_max_c":31.2,"temp_min_c":27.0},{"day":7,"date":"2026-06-28","rainfall_mm":14.4,"temp_max_c":32.7,"temp_min_c":27.6}]'),

('77000000-0000-0000-0000-000000000002',
 'Guwahati, Assam', 'India',
 26.18, 91.77,
 28.4, 91.0, 112.6,
 18.0, 1002.0, 98.0, 2.1, 2.0,
 '[{"day":1,"date":"2026-06-22","rainfall_mm":112.6,"temp_max_c":29.1,"temp_min_c":24.8},{"day":2,"date":"2026-06-23","rainfall_mm":98.4,"temp_max_c":28.6,"temp_min_c":24.2},{"day":3,"date":"2026-06-24","rainfall_mm":42.2,"temp_max_c":30.2,"temp_min_c":25.1},{"day":4,"date":"2026-06-25","rainfall_mm":68.8,"temp_max_c":29.4,"temp_min_c":24.6},{"day":5,"date":"2026-06-26","rainfall_mm":124.0,"temp_max_c":27.8,"temp_min_c":23.9},{"day":6,"date":"2026-06-27","rainfall_mm":88.2,"temp_max_c":28.9,"temp_min_c":24.5},{"day":7,"date":"2026-06-28","rainfall_mm":56.4,"temp_max_c":29.7,"temp_min_c":25.2}]'),

('77000000-0000-0000-0000-000000000003',
 'Delhi, National Capital Territory', 'India',
 28.61, 77.21,
 38.6, 52.0, 2.1,
 14.0, 1000.0, 40.0, 8.4, 8.0,
 '[{"day":1,"date":"2026-06-22","rainfall_mm":2.1,"temp_max_c":39.2,"temp_min_c":30.8},{"day":2,"date":"2026-06-23","rainfall_mm":0.0,"temp_max_c":40.1,"temp_min_c":31.4},{"day":3,"date":"2026-06-24","rainfall_mm":8.4,"temp_max_c":37.6,"temp_min_c":29.9},{"day":4,"date":"2026-06-25","rainfall_mm":14.2,"temp_max_c":36.8,"temp_min_c":29.2},{"day":5,"date":"2026-06-26","rainfall_mm":0.0,"temp_max_c":40.4,"temp_min_c":32.1},{"day":6,"date":"2026-06-27","rainfall_mm":1.8,"temp_max_c":39.8,"temp_min_c":31.6},{"day":7,"date":"2026-06-28","rainfall_mm":4.6,"temp_max_c":38.4,"temp_min_c":30.8}]'),

('77000000-0000-0000-0000-000000000004',
 'Dhaka, Dhaka Division', 'Bangladesh',
 23.81, 90.41,
 31.2, 88.0, 84.6,
 16.0, 1004.0, 94.0, 3.8, 3.0,
 '[{"day":1,"date":"2026-06-22","rainfall_mm":84.6,"temp_max_c":31.8,"temp_min_c":27.2},{"day":2,"date":"2026-06-23","rainfall_mm":92.4,"temp_max_c":30.9,"temp_min_c":26.8},{"day":3,"date":"2026-06-24","rainfall_mm":68.2,"temp_max_c":31.4,"temp_min_c":27.0},{"day":4,"date":"2026-06-25","rainfall_mm":48.0,"temp_max_c":32.1,"temp_min_c":27.4},{"day":5,"date":"2026-06-26","rainfall_mm":56.8,"temp_max_c":31.6,"temp_min_c":26.9},{"day":6,"date":"2026-06-27","rainfall_mm":28.4,"temp_max_c":32.8,"temp_min_c":27.6},{"day":7,"date":"2026-06-28","rainfall_mm":48.0,"temp_max_c":31.2,"temp_min_c":27.1}]'),

('77000000-0000-0000-0000-000000000005',
 'Cairo, Cairo Governorate', 'Egypt',
 30.06, 31.22,
 34.8, 28.0, 0.0,
 12.0, 1012.0, 5.0, 18.0, 10.0,
 '[{"day":1,"date":"2026-06-22","rainfall_mm":0.0,"temp_max_c":35.2,"temp_min_c":26.8},{"day":2,"date":"2026-06-23","rainfall_mm":0.0,"temp_max_c":36.1,"temp_min_c":27.2},{"day":3,"date":"2026-06-24","rainfall_mm":0.0,"temp_max_c":35.8,"temp_min_c":27.0},{"day":4,"date":"2026-06-25","rainfall_mm":0.0,"temp_max_c":36.4,"temp_min_c":27.4},{"day":5,"date":"2026-06-26","rainfall_mm":0.0,"temp_max_c":35.6,"temp_min_c":26.9},{"day":6,"date":"2026-06-27","rainfall_mm":0.0,"temp_max_c":34.9,"temp_min_c":26.4},{"day":7,"date":"2026-06-28","rainfall_mm":0.0,"temp_max_c":35.2,"temp_min_c":26.8}]'),

('77000000-0000-0000-0000-000000000006',
 'Los Angeles, California', 'United States',
 34.05, -118.24,
 24.6, 62.0, 0.0,
 8.0, 1015.0, 20.0, 22.0, 9.0,
 '[{"day":1,"date":"2026-06-22","rainfall_mm":0.0,"temp_max_c":25.4,"temp_min_c":17.8},{"day":2,"date":"2026-06-23","rainfall_mm":0.0,"temp_max_c":26.2,"temp_min_c":18.1},{"day":3,"date":"2026-06-24","rainfall_mm":0.0,"temp_max_c":24.8,"temp_min_c":17.4},{"day":4,"date":"2026-06-25","rainfall_mm":2.4,"temp_max_c":22.1,"temp_min_c":16.9},{"day":5,"date":"2026-06-26","rainfall_mm":0.0,"temp_max_c":25.8,"temp_min_c":17.2},{"day":6,"date":"2026-06-27","rainfall_mm":0.0,"temp_max_c":27.4,"temp_min_c":18.4},{"day":7,"date":"2026-06-28","rainfall_mm":0.0,"temp_max_c":26.8,"temp_min_c":18.0}]')

ON CONFLICT DO NOTHING;

-- =============================================================================
-- AGENT MEMORY  (seed knowledge for each agent)
-- =============================================================================
INSERT INTO agent_memory (agent_id, memory_type, content, context, importance) VALUES
('flood_agent', 'semantic',
 'Brahmaputra at 7.2m at Guwahati–Saraighat gauge. Flood threshold is 6.0m. CRITICAL status. Last major flood: 2022 (8.1m peak). 4 districts at risk: Kamrup, Barpeta, Morigaon, Nagaon.',
 '{"river":"Brahmaputra","country":"India","state":"Assam","last_checked":"2026-06-22T06:00:00Z"}', 0.98),

('flood_agent', 'semantic',
 'Buriganga River Dhaka: flood threshold 5.5m, current 6.8m. 84% storm probability. 890K people at risk in Dhaka, Narayanganj, Munshiganj.',
 '{"river":"Buriganga","country":"Bangladesh","state":"Dhaka Division"}', 0.96),

('leak_detection_agent', 'semantic',
 'Mumbai Zone 7 Dharavi–Kurla DN600 trunk main: inlet 5.8 bar, outlet 3.4 bar, pressure drop 2.4 bar. Flow loss 22.3% (4,130 m3/day). Economic impact INR 2.1M/month. Pipe age: 57 years (1968 cast iron).',
 '{"city":"Mumbai","zone":"Zone 7","pipeline":"MUM-ZONE7-DN600"}', 0.95),

('water_quality_agent', 'semantic',
 'Dhaka Buriganga intake: turbidity 18.2 NTU (WHO limit 4.0), chlorine 0.12 mg/L (below 0.2 minimum), DO 4.8 mg/L (below 6.0), Lead 12.4 ppb (above 10 limit), Arsenic 8.9 ppb. 3 WHO violations. 8.9M at risk.',
 '{"city":"Dhaka City","country":"Bangladesh","status":"danger"}', 0.97),

('reservoir_agent', 'semantic',
 'Hirakud Reservoir at 91.2% (7,420 MCM of 8,136 MCM). Inflow 480 m3/s, outflow 320 m3/s. Net surplus +160 m3/s. Overflow risk HIGH. Recommended release: increase to 480 m3/s.',
 '{"reservoir":"Hirakud","country":"India","state":"Odisha"}', 0.93),

('climate_agent', 'semantic',
 'Global temperature anomaly +1.48C above 1990 baseline. Sea level +112mm since 1990. Arctic ice -14.2%. 287 extreme weather events in 2025. CO2 at 422.8 ppm.',
 '{"scope":"global","last_updated":"2026-06-22"}', 0.90),

('rainfall_agent', 'semantic',
 'Guwahati/Assam 7-day forecast: 590.4mm total (from Open-Meteo). Storm probability 78%. All 7 days have heavy rain (>50mm). Peak day: 124mm on day 5. Flood risk HIGH.',
 '{"location":"Guwahati","country":"India","state":"Assam","source":"Open-Meteo"}', 0.94)

ON CONFLICT DO NOTHING;

-- =============================================================================
-- SIMULATIONS  (pre-run scenarios for demo)
-- =============================================================================
INSERT INTO simulations
    (id, name, scenario_type, parameters, results, impact_assessment, recommendations, status, created_by)
VALUES
('55000000-0000-0000-0000-000000000001',
 'Brahmaputra 100-year Flood Simulation',
 'heavy_rain',
 '{"rain_intensity_mm_per_day":200,"duration_days":5,"catchment":"Brahmaputra","upstream_reservoir_pct":87.4}',
 '{"peak_level_m":9.4,"peak_discharge_m3s":68000,"flood_area_km2":4800,"days_to_peak":3}',
 '{"population_at_risk":1200000,"economic_loss_usd_million":840,"agricultural_loss_ha":182000,"infrastructure_damage_bridges":24}',
 '["Pre-deploy NDRF in 6 districts 72 hours before peak","Issue Red Alert for all Assam districts","Coordinate rail suspension for Lumding–Guwahati corridor","Activate PM Relief Fund emergency disbursement","Pre-position 200 metric tons of dry ration"]',
 'completed', 'flood_agent'),

('55000000-0000-0000-0000-000000000002',
 'Mumbai Water Supply Disruption – Zone 7 Failure',
 'contamination',
 '{"zone":"Zone 7","pipeline":"MUM-ZONE7-DN600","failure_mode":"burst","pipe_diameter_mm":600}',
 '{"daily_supply_loss_mld":680,"affected_population":2400000,"pressure_drop_zones":["Dharavi","Kurla","Mankhurd","Chembur"],"restoration_hours_est":18}',
 '{"economic_impact_inr_day":3200000,"health_risk_score":72,"alternative_sources_available":true}',
 '["Activate Thane–Belapur bypass feed immediately","Deploy 120 MCGM tankers to affected wards","Issue boil-water advisory for 4 wards","Engage HAM contractors for emergency pipe replacement","Set up 48 community water points with 5000L tanks"]',
 'completed', 'leak_detection_agent'),

('55000000-0000-0000-0000-000000000003',
 'Rajasthan Drought Scenario – Summer 2027',
 'drought',
 '{"deficit_pct":45,"duration_months":8,"bisalpur_start_pct":35,"groundwater_depth_m":42}',
 '{"bisalpur_empty_days":62,"groundwater_critical_days":180,"population_without_water":3100000,"crop_failure_ha":480000}',
 '{"economic_loss_usd_million":1200,"migration_risk_people":280000,"malnutrition_risk_children":48000}',
 '["Emergency Chambal–Bisalpur link canal fast-track","Mandate 50% reduction in irrigation water allocation","Deploy 2000 rural tankers on 3-day rotation","Activate National Water Mission emergency fund","Expedite 180 new community handpumps in 12 districts"]',
 'completed', 'climate_agent')

ON CONFLICT DO NOTHING;
