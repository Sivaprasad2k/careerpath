CREATE TABLE audit_logs (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL REFERENCES users(id),
    entity_type     VARCHAR(100)    NOT NULL,
    entity_id       UUID            NOT NULL,
    action          VARCHAR(100)    NOT NULL,
    old_value       JSONB,
    new_value       JSONB,
    ip_address      VARCHAR(45),
    created_at      TIMESTAMP       NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_entity   ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user_id  ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action   ON audit_logs(action);
