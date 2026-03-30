-- Performance indexes for 300k+ records optimization

-- Composite index for the most common guests query pattern (event + status + created_at sort)
CREATE INDEX IF NOT EXISTS idx_guests_event_status_created 
  ON guests(event_id, status, created_at DESC);

-- Index for ticket_type filtering
CREATE INDEX IF NOT EXISTS idx_guests_ticket_type 
  ON guests(ticket_type);

-- Composite index for event + ticket_type queries (dashboard stats)
CREATE INDEX IF NOT EXISTS idx_guests_event_ticket_type 
  ON guests(event_id, ticket_type);

-- GIN index for zones array containment queries
CREATE INDEX IF NOT EXISTS idx_guests_zones_gin 
  ON guests USING GIN(zones);

-- Index for email_status filtering
CREATE INDEX IF NOT EXISTS idx_guests_email_status 
  ON guests(email_status);

-- Index on guests created_at for sorting
CREATE INDEX IF NOT EXISTS idx_guests_created_at 
  ON guests(created_at DESC);

-- Events organizer_id for RLS and dashboard queries
CREATE INDEX IF NOT EXISTS idx_events_organizer_id 
  ON events(organizer_id);

-- Events status for filtering
CREATE INDEX IF NOT EXISTS idx_events_status 
  ON events(status);

-- Composite for accreditations common query
CREATE INDEX IF NOT EXISTS idx_accreditations_event_user 
  ON accreditations(event_id, user_id);

-- Access logs timestamp for recent queries
CREATE INDEX IF NOT EXISTS idx_access_logs_event_created 
  ON access_logs(event_id, created_at DESC);

-- Wristbands rfid lookup
CREATE INDEX IF NOT EXISTS idx_wristbands_rfid_event 
  ON wristbands(rfid_code, event_id) WHERE is_active = true;

-- Zone presence active lookups
CREATE INDEX IF NOT EXISTS idx_zone_presence_active 
  ON zone_presence(wristband_id, zone_name) WHERE is_inside = true;
