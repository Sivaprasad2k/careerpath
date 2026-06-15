-- Timeline Events
CREATE TABLE timeline_events (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id      UUID            NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type          VARCHAR(100)    NOT NULL,
    description         TEXT            NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT now()
);
CREATE INDEX idx_timeline_events_opportunity_id ON timeline_events(opportunity_id);
CREATE INDEX idx_timeline_events_user_id ON timeline_events(user_id);

-- Reminders
CREATE TABLE reminders (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id      UUID            NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               VARCHAR(255)    NOT NULL,
    reminder_type       VARCHAR(100)    NOT NULL,
    remind_at           TIMESTAMP       NOT NULL,
    is_dismissed        BOOLEAN         NOT NULL DEFAULT false,
    created_at          TIMESTAMP       NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT now()
);
CREATE INDEX idx_reminders_opportunity_id ON reminders(opportunity_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_is_dismissed ON reminders(user_id, is_dismissed);

-- Notes
CREATE TABLE notes (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id      UUID            NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content             TEXT            NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT now()
);
CREATE INDEX idx_notes_opportunity_id ON notes(opportunity_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);

-- Calendar Events
CREATE TABLE calendar_events (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id      UUID            NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               VARCHAR(255)    NOT NULL,
    event_type          VARCHAR(100)    NOT NULL,
    event_date          TIMESTAMP       NOT NULL,
    description         TEXT,
    created_at          TIMESTAMP       NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT now()
);
CREATE INDEX idx_calendar_events_opportunity_id ON calendar_events(opportunity_id);
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_date ON calendar_events(user_id, event_date);

-- Documents
CREATE TABLE documents (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id      UUID            NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name           VARCHAR(255)    NOT NULL,
    file_type           VARCHAR(100)    NOT NULL,
    file_size           BIGINT          NOT NULL,
    file_path           VARCHAR(1000)   NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT now()
);
CREATE INDEX idx_documents_opportunity_id ON documents(opportunity_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
