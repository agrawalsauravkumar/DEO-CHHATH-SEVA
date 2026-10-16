-- ================================================================
-- DEO CHHATH SEVA - PostgreSQL + PostGIS Database Architecture
-- NextGen Dev Bhoomi Foundation — “रास्ता भी • सहायता भी • सेवा भी”
-- ================================================================

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Enums
CREATE TYPE user_role AS ENUM ('USER', 'VOLUNTEER', 'ADMIN', 'SUPER_ADMIN', 'CONTENT_ADMIN', 'FACILITY_ADMIN', 'HELP_ADMIN');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING');
CREATE TYPE volunteer_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED');
CREATE TYPE help_request_status AS ENUM ('RECEIVED', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CANCELLED');
CREATE TYPE lost_found_type AS ENUM ('LOST_PERSON', 'FOUND_PERSON', 'LOST_ITEM', 'FOUND_ITEM');
CREATE TYPE lost_found_status AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'MATCH_FOUND', 'VERIFICATION_REQUIRED', 'TRANSFERRED_TO_HELP_POINT', 'RESOLVED', 'CLOSED', 'CANCELLED');
CREATE TYPE facility_category AS ENUM ('PARKING', 'SHUTTLE', 'MEDICAL', 'TOILET', 'WATER', 'HELP', 'RELIGIOUS');
CREATE TYPE parking_status AS ENUM ('AVAILABLE', 'LIMITED', 'FULL', 'CLOSED', 'UNKNOWN');
CREATE TYPE announcement_category AS ENUM ('EMERGENCY', 'ROUTE', 'PARKING', 'SHUTTLE', 'MEDICAL', 'HELP', 'GENERAL', 'CHHATH_INFO', 'SAFETY');
CREATE TYPE announcement_priority AS ENUM ('NORMAL', 'IMPORTANT', 'URGENT', 'EMERGENCY');
CREATE TYPE announcement_status AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'EXPIRED');
CREATE TYPE route_alert_type AS ENUM ('ROUTE_ALERT', 'ROAD_CLOSURE', 'DIVERSION');

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(150) NOT NULL,
    role user_role DEFAULT 'USER',
    status user_status DEFAULT 'ACTIVE',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- 4. Volunteers Table
CREATE TABLE IF NOT EXISTS volunteers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_number VARCHAR(50) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    gender VARCHAR(20),
    age INTEGER,
    status volunteer_status DEFAULT 'PENDING',
    service_areas TEXT[] DEFAULT '{}',
    services_offered TEXT[] DEFAULT '{}',
    languages TEXT[] NOT NULL DEFAULT '{}',
    availability_time VARCHAR(150),
    current_assigned_zone VARCHAR(100),
    is_on_duty BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS languages TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS availability_time VARCHAR(150);
CREATE UNIQUE INDEX IF NOT EXISTS idx_volunteers_user_id_unique
    ON volunteers (user_id) WHERE user_id IS NOT NULL;

-- 5. Facilities Table (Unified)
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),
    category facility_category NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOMETRY(Point, 4326),
    address TEXT,
    description TEXT,
    phone VARCHAR(50),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Parking Facilities Table
CREATE TABLE IF NOT EXISTS parkings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    total_capacity INTEGER,
    available_capacity INTEGER,
    capacity_display VARCHAR(50),
    vehicle_types TEXT[] DEFAULT '{"twoWheeler","fourWheeler"}',
    status parking_status DEFAULT 'UNKNOWN',
    is_verified BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Shuttle Points & Routes
CREATE TABLE IF NOT EXISTS shuttle_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    origin VARCHAR(200),
    destination VARCHAR(200),
    frequency VARCHAR(100),
    fare VARCHAR(50) DEFAULT 'मुफ्त (Free)',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shuttle_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    route_id UUID REFERENCES shuttle_routes(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    point_type VARCHAR(50) DEFAULT 'BOTH',
    is_verified BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Help Requests
CREATE TABLE IF NOT EXISTS help_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    user_name VARCHAR(150),
    user_phone VARCHAR(20),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location GEOMETRY(Point, 4326),
    status help_request_status DEFAULT 'RECEIVED',
    priority VARCHAR(20) DEFAULT 'NORMAL',
    assigned_volunteer_id UUID REFERENCES volunteers(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Lost & Found Reports
CREATE TABLE IF NOT EXISTS lost_found_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id VARCHAR(50) UNIQUE NOT NULL,
    type lost_found_type NOT NULL,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location_name VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location GEOMETRY(Point, 4326),
    identifying_features TEXT,
    contact_name VARCHAR(150),
    contact_phone VARCHAR(20),
    photo_url TEXT,
    status lost_found_status DEFAULT 'SUBMITTED',
    is_flagged_misuse BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    short_description TEXT NOT NULL,
    details TEXT,
    category announcement_category NOT NULL,
    priority announcement_priority DEFAULT 'NORMAL',
    status announcement_status DEFAULT 'PUBLISHED',
    is_verified_official BOOLEAN DEFAULT true,
    source VARCHAR(200) DEFAULT 'जिला प्रशासन एवं मेला नियंत्रण कक्ष',
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Route Alerts & Closures
CREATE TABLE IF NOT EXISTS route_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID REFERENCES announcements(id) ON DELETE SET NULL,
    type route_alert_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    road_name VARCHAR(200) NOT NULL,
    reason TEXT NOT NULL,
    affected_area VARCHAR(255),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters INTEGER DEFAULT 350,
    geometry GEOMETRY(Geometry, 4326),
    start_time VARCHAR(50),
    end_time VARCHAR(50),
    alternative_route_available BOOLEAN DEFAULT false,
    alternative_route_advice TEXT,
    is_verified BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(150),
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    old_value_summary TEXT,
    new_value_summary TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    designation VARCHAR(120) NOT NULL,
    photo_path VARCHAR(255),
    photo_permission_confirmed BOOLEAN NOT NULL DEFAULT false,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_team_members_public
    ON team_members (is_published, created_at DESC);

CREATE TABLE IF NOT EXISTS team_demo_seed_state (
    seed_key VARCHAR(100) PRIMARY KEY,
    seeded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. Spatial Indexes (PostGIS GIST)
CREATE INDEX IF NOT EXISTS idx_facilities_location ON facilities USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_volunteers_location ON volunteers USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_help_requests_location ON help_requests USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_lost_found_location ON lost_found_reports USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_route_alerts_geometry ON route_alerts USING GIST (geometry);

-- 14. Standard Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_facilities_category ON facilities (category);
CREATE INDEX IF NOT EXISTS idx_facilities_active ON facilities (is_active, is_archived);
CREATE INDEX IF NOT EXISTS idx_help_requests_status ON help_requests (status);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers (status);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements (status, is_verified_official);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);
