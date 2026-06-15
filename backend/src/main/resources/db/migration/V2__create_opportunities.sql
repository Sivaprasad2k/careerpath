CREATE TABLE opportunities (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name        VARCHAR(255)    NOT NULL,
    role_name           VARCHAR(255)    NOT NULL,
    location            VARCHAR(255),
    source              VARCHAR(1000),
    salary              VARCHAR(100),
    priority            VARCHAR(50)     NOT NULL DEFAULT 'MEDIUM',
    application_date    DATE,
    current_status      VARCHAR(50)     NOT NULL DEFAULT 'DRAFT',
    created_at          TIMESTAMP       NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT now(),
    CONSTRAINT chk_opportunity_status CHECK (current_status IN (
        'DRAFT', 'APPLIED', 'ASSESSMENT_RECEIVED', 'ASSESSMENT_COMPLETED',
        'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_RECEIVED',
        'ACCEPTED', 'REJECTED', 'DECLINED', 'WITHDRAWN'
    )),
    CONSTRAINT chk_opportunity_priority CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW'))
);

CREATE INDEX idx_opportunities_user_id ON opportunities(user_id);
CREATE INDEX idx_opportunities_status  ON opportunities(current_status);
