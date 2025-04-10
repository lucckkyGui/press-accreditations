
-- Database schema definition for Supabase

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    plan_type VARCHAR NOT NULL DEFAULT 'free',
    plan_expires_at TIMESTAMP WITH TIME ZONE,
    contact_email VARCHAR,
    logo_url VARCHAR,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    email VARCHAR NOT NULL UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    role VARCHAR NOT NULL CHECK (role IN ('admin', 'organizer', 'staff', 'guest')),
    organization_id UUID REFERENCES organizations(id),
    avatar_url VARCHAR,
    last_active TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description TEXT,
    location VARCHAR,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    created_by UUID NOT NULL REFERENCES users(id),
    is_published BOOLEAN DEFAULT false,
    venue JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ticket types table
CREATE TABLE ticket_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    capacity INTEGER,
    color VARCHAR,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Guests table
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    company VARCHAR,
    phone VARCHAR,
    zone VARCHAR NOT NULL CHECK (zone IN ('vip', 'press', 'staff', 'general')),
    status VARCHAR NOT NULL CHECK (status IN ('invited', 'confirmed', 'declined', 'checked-in')),
    email_status VARCHAR CHECK (email_status IN ('sent', 'opened', 'failed', 'unknown')),
    qr_code VARCHAR NOT NULL UNIQUE,
    invitation_sent_at TIMESTAMP WITH TIME ZONE,
    invitation_opened_at TIMESTAMP WITH TIME ZONE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    notes TEXT,
    tags VARCHAR[],
    custom_field_values JSONB DEFAULT '{}',
    ticket_type_id UUID REFERENCES ticket_types(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Scans table
CREATE TABLE scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    scanned_by UUID NOT NULL REFERENCES users(id),
    location VARCHAR,
    device_info JSONB DEFAULT '{}',
    verification_method VARCHAR CHECK (verification_method IN ('qr', 'manual', 'face', 'id')),
    scan_result VARCHAR CHECK (scan_result IN ('success', 'duplicate', 'expired', 'invalid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Email templates table
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL CHECK (type IN ('invitation', 'reminder', 'confirmation', 'custom')),
    subject VARCHAR NOT NULL,
    content TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES users(id)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR NOT NULL CHECK (type IN ('reminder', 'update', 'cancellation', 'custom')),
    status VARCHAR NOT NULL CHECK (status IN ('scheduled', 'sent', 'failed')),
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    template_id UUID REFERENCES email_templates(id),
    created_by UUID NOT NULL REFERENCES users(id),
    recipient_filter JSONB DEFAULT '{}',
    delivery_stats JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row Level Security (RLS) Policies

-- Organizations policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own organization"
    ON organizations FOR SELECT
    USING (id IN (
        SELECT organization_id FROM users WHERE users.id = auth.uid()
    ));

CREATE POLICY "Only admins can update their organization"
    ON organizations FOR UPDATE
    USING (id IN (
        SELECT organization_id FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    ));

-- Users policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of their organization"
    ON users FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE users.id = auth.uid()
    ));

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (id = auth.uid());

-- Events policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events of their organization"
    ON events FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE users.id = auth.uid()
    ));

CREATE POLICY "Organizers and admins can create events"
    ON events FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT id FROM users WHERE role IN ('organizer', 'admin')
    ));

CREATE POLICY "Event creators and admins can update events"
    ON events FOR UPDATE
    USING (created_by = auth.uid() OR auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin' AND organization_id = events.organization_id
    ));

-- Create indexes for performance
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_events_organization ON events(organization_id);
CREATE INDEX idx_guests_event ON guests(event_id);
CREATE INDEX idx_guests_status ON guests(status);
CREATE INDEX idx_scans_event ON scans(event_id);
CREATE INDEX idx_scans_guest ON scans(guest_id);
