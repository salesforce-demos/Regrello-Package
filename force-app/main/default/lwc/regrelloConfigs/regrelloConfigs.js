const SECTION_KEYS = {
    DOCUMENT_SUBMISSION: { id: 'documentSubmission', title: 'Document Submission' },
    DOCUMENT_PROCESSING_AND_VERIFICATION: { id: 'documentProcessingAndVerification', title: 'Document Processing and Verification' },
    COMPLIANCE_REVIEW: { id: 'complianceReview', title: 'Compliance Review' },
    CONTRACT_GENERATION_AND_APPROVAL: { id: 'contractGenerationAndApproval', title: 'Contract Generation and Approval' },
    FINANCE_APPROVAL: { id: 'financeApproval', title: 'Finance Approval' },
    LEGAL_REVIEW: { id: 'legalReview', title: 'Legal Review' },
    CONTRACT_EXECUTION: { id: 'contractExecution', title: 'Contract Execution' },
    ONBOARDING_AND_PROVISIONING: { id: 'onboardingAndProvisioning', title: 'Onboarding and Provisioning' },
    IT_ESCALATION_REVIEW: { id: 'itEscalationReview', title: 'IT Escalation Review' }
};

const BLUEPRINT_SECTION_TITLES = [
    SECTION_KEYS.DOCUMENT_SUBMISSION.title,
    SECTION_KEYS.DOCUMENT_PROCESSING_AND_VERIFICATION.title,
    SECTION_KEYS.COMPLIANCE_REVIEW.title,
    SECTION_KEYS.CONTRACT_GENERATION_AND_APPROVAL.title,
    SECTION_KEYS.FINANCE_APPROVAL.title,
    SECTION_KEYS.LEGAL_REVIEW.title,
    SECTION_KEYS.CONTRACT_EXECUTION.title,
    SECTION_KEYS.ONBOARDING_AND_PROVISIONING.title,
    SECTION_KEYS.IT_ESCALATION_REVIEW.title
];

const SECTION_ROWS = {
    [SECTION_KEYS.DOCUMENT_SUBMISSION.title]: [
        { title: 'Submit Onboarding Forms', assignee: 'Service Provider Partner', startsDetail: 'When the stage starts', timeToComplete: '3 days' }
    ],
    [SECTION_KEYS.DOCUMENT_PROCESSING_AND_VERIFICATION.title]: [
        { title: 'Extract Insurance Details from Document', assignee: 'Document Agent', startsDetail: 'after Extract Tax Details from...', timeToComplete: 'No due date set' },
        { title: 'Extract Tax Details from Document', assignee: 'Document Agent', startsDetail: 'When the stage starts', timeToComplete: 'No due date set' },
        { title: 'Extract Compliance Details from Form', assignee: 'Document Agent', startsDetail: 'after Extract Insurance Detail...', timeToComplete: 'No due date set' },
        { title: 'Validate Form Completeness', assignee: 'Excel Agent', startsDetail: 'after Extract Compliance Det...', timeToComplete: 'No due date set' },
        { title: 'Check Against Procurement Data', assignee: 'Onboarding', startsDetail: 'When the stage starts', timeToComplete: '1 day' }
    ],
    [SECTION_KEYS.COMPLIANCE_REVIEW.title]: [
        { title: 'Compliance Review', assignee: 'Compliance', startsDetail: 'When the stage starts', timeToComplete: '2 days' }
    ],
    [SECTION_KEYS.CONTRACT_GENERATION_AND_APPROVAL.title]: [
        { title: 'Generate Draft Contract', assignee: 'Document Agent', startsDetail: 'When the stage starts', timeToComplete: 'No due date set' },
        { title: 'Analyze Draft Contract for Approval', assignee: 'Excel Agent', startsDetail: 'after Generate Draft Contract', timeToComplete: 'No due date set' },
        { title: 'Review and Approve Contract', assignee: 'Document Agent', startsDetail: 'after Analyze Draft Contract f...', timeToComplete: '1 day' }
    ],
    [SECTION_KEYS.FINANCE_APPROVAL.title]: [
        { title: 'Finance Team Contract Approval', assignee: 'Finance', startsDetail: 'When the stage starts', timeToComplete: '2 days' }
    ],
    [SECTION_KEYS.LEGAL_REVIEW.title]: [
        { title: 'Legal Team Contract Review', assignee: 'Legal', startsDetail: 'When the stage starts', timeToComplete: 'No due date set' }
    ],
    [SECTION_KEYS.CONTRACT_EXECUTION.title]: [
        { title: 'Send Contract to Service Provider', assignee: 'None', startsDetail: 'When the stage starts', timeToComplete: '1 day' },
        { title: 'Sign Contract', assignee: 'Service Provider Partner', startsDetail: 'after Send Contract to Servic...', timeToComplete: '5 days' }
    ],
    [SECTION_KEYS.ONBOARDING_AND_PROVISIONING.title]: [
        { title: 'Conduct Onboarding Training & Verify Certificate', assignee: 'Onboarding Team', startsDetail: 'When the stage starts', timeToComplete: '1 day' },
        { title: 'IT System Provisioning', assignee: 'IT Team', startsDetail: 'after Conduct Onboarding Tr...', timeToComplete: '1 day' }
    ],
    [SECTION_KEYS.IT_ESCALATION_REVIEW.title]: [
        { title: 'IT Escalation Review', assignee: 'IT Team', startsDetail: 'When the stage starts', timeToComplete: '1 day' }
    ]
};

const SECTION_HEADER_STARTS = {
    [SECTION_KEYS.DOCUMENT_SUBMISSION.title]: { label: 'when the workflow starts', asLink: false },
    [SECTION_KEYS.DOCUMENT_PROCESSING_AND_VERIFICATION.title]: { label: 'after the previous stage', asLink: false },
    [SECTION_KEYS.COMPLIANCE_REVIEW.title]: { label: 'when 1 condition is met', asLink: true },
    [SECTION_KEYS.CONTRACT_GENERATION_AND_APPROVAL.title]: { label: 'after the previous stage', asLink: false },
    [SECTION_KEYS.FINANCE_APPROVAL.title]: { label: 'when 2 conditions are met', asLink: true },
    [SECTION_KEYS.LEGAL_REVIEW.title]: { label: 'when 1 condition is met', asLink: true },
    [SECTION_KEYS.CONTRACT_EXECUTION.title]: { label: 'when 1 condition is met', asLink: true },
    [SECTION_KEYS.ONBOARDING_AND_PROVISIONING.title]: { label: 'after the previous stage', asLink: false },
    [SECTION_KEYS.IT_ESCALATION_REVIEW.title]: { label: 'when 1 condition is met', asLink: true }
};

const SECTION_START_MODE = BLUEPRINT_SECTION_TITLES.reduce((acc, sectionTitle) => ({
    ...acc,
    [sectionTitle]: 'sequential'
}), {});

const GENERATE_BLUEPRINT_CONFIG = {
    INDUSTRY_OPTIONS: [
        'Automotive', 'Consumer Packaged Goods', 'Electronics', 'Fashion',
        'Healthcare', 'Oil and Gas', 'Pharmaceuticals', 'Software'
    ],
    BLUEPRINT_SECTION_TITLES,
    SECTION_ROWS,
    SECTION_HEADER_STARTS,
    FORM_STAGES: [
        {
            id: 'forms',
            title: 'Data Consistency Check Form',
            fields: [
                { id: 'supplierName', label: 'Supplier Name', type: 'text' },
                { id: 'supplierEmail', label: 'Supplier Contact Email', type: 'text' },
                { id: 'supplierContact', label: 'Supplier Contact Person', type: 'text' },
                { id: 'supplierPhone', label: 'Supplier Contact Phone Number', type: 'tel' },
                { id: 'supplierReg', label: 'Supplier Business Registration Number', type: 'text' },
                { id: 'dataStatus', label: 'Data Consistency Status', type: 'select', options: ['Pending', 'Pass', 'Fail', 'Needs review'] },
                { id: 'consistencyDetails', label: 'Consistency Check Details', type: 'text' }
            ]
        },
        {
            id: 'finalize',
            title: 'Financial Document Validation Form',
            fields: [
                { id: 'supplierFinancialDocs', label: 'Supplier Financial Documents', type: 'upload' },
                { id: 'financialValidationStatus', label: 'Financial Document Validation Status', type: 'select', options: ['Pending', 'Pass', 'Fail', 'Needs review'] },
                { id: 'financialValidationComments', label: 'Financial Document Validation Comments', type: 'text' }
            ]
        },
        {
            id: 'risk',
            title: 'Financial Risk Assessment Form',
            fields: [
                { id: 'docValidationStatus', label: 'Financial Document Validation Status', type: 'select', options: ['Pending', 'Pass', 'Fail', 'Needs review'] },
                { id: 'docValidationComments', label: 'Financial Document Validation Comments', type: 'text' },
                { id: 'supplierFinancialDocsRisk', label: 'Supplier Financial Documents', type: 'upload' },
                { id: 'financialRiskLevel', label: 'Financial Risk Level', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
                { id: 'financialRiskJustification', label: 'Financial Risk Justification', type: 'text' }
            ]
        },
        {
            id: 'security',
            title: 'Security Practices Evaluation Form',
            fields: [
                { id: 'securityPosture', label: 'Security Posture', type: 'select', options: ['Strong', 'Adequate', 'Needs improvement', 'Critical'] },
                { id: 'encryptionStandards', label: 'Encryption Standards', type: 'select', options: ['AES-256', 'TLS 1.3', 'Mixed', 'Under review'] },
                { id: 'accessControlNotes', label: 'Access Control Review Notes', type: 'text' },
                { id: 'securityEvidence', label: 'Security Evidence Upload', type: 'upload' },
                { id: 'securityEvaluationSummary', label: 'Security Evaluation Summary', type: 'text' }
            ]
        },
        {
            id: 'riskScore',
            title: 'Risk Score Calculation Form',
            fields: [
                { id: 'riskModel', label: 'Scoring Model', type: 'select', options: ['Standard', 'Conservative', 'Weighted', 'Custom'] },
                { id: 'inputFactors', label: 'Input Factors', type: 'text' },
                { id: 'weightedScore', label: 'Weighted Risk Score', type: 'text' },
                { id: 'confidenceBand', label: 'Confidence Band', type: 'select', options: ['High', 'Medium', 'Low'] },
                { id: 'scoreRationale', label: 'Score Rationale', type: 'text' }
            ]
        },
        {
            id: 'certification',
            title: 'Certification Review Form',
            fields: [
                { id: 'certificateType', label: 'Certificate Type', type: 'select', options: ['ISO 9001', 'ISO 27001', 'SOC 2', 'Industry-specific'] },
                { id: 'issuer', label: 'Issuing Body', type: 'text' },
                { id: 'certStatus', label: 'Certification Status', type: 'select', options: ['Valid', 'Expiring soon', 'Expired', 'Pending renewal'] },
                { id: 'certDocuments', label: 'Certificate Documents', type: 'upload' },
                { id: 'certReviewNotes', label: 'Certification Review Notes', type: 'text' }
            ]
        },
        {
            id: 'supplierConfirm',
            title: 'Supplier Confirmation Form',
            fields: [
                { id: 'supplierDecision', label: 'Supplier Decision', type: 'select', options: ['Confirm', 'Reject', 'Request more information'] },
                { id: 'decisionOwner', label: 'Decision Owner', type: 'text' },
                { id: 'decisionEmail', label: 'Decision Owner Email', type: 'text' },
                { id: 'implementationDate', label: 'Target Implementation Date', type: 'text' },
                { id: 'decisionComments', label: 'Decision Comments', type: 'text' }
            ]
        }
    ],
    STEPS: ['Provide inputs', 'Generate blueprint', 'Generate forms', 'Finalize import', 'Summary']
};

const SUPPLIER_BLUEPRINT_CONFIG = {
    BLUEPRINT_SECTION_TITLES: GENERATE_BLUEPRINT_CONFIG.BLUEPRINT_SECTION_TITLES,
    SECTION_ROWS: GENERATE_BLUEPRINT_CONFIG.SECTION_ROWS,
    SECTION_START_MODE,
    STAGE_TABS: ['Stages', 'About', 'Settings'],
    RIGHT_TABS: ['Schedule', 'Data', 'Forms', 'Documents', 'Access'],
    DAY_LABELS: ['DAY 0', 'DAY 3', 'DAY 6', 'DAY 9', 'DAY 12', 'DAY 15', 'DAY 18']
};

const EDIT_MODAL_STATE = {
    localName: '',
    localDescription: 'Review the draft contract and the provided recommendation. Based on your assessment, decide whether to approve the contract, reject it, or escalate it to the legal team for further review.',
    localDueAmount: '1',
    localDueUnit: 'Days',
    localStartPrimary: 'After another task ends',
    localStartAfterTask: 'Analyze Draft Contract for Approval',
    assignees: [
        {
            id: '2',
            label: 'Document Agent',
            isLetterIcon: false,
            iconStyle: '-webkit-mask-image: url(/resource/regrelloAssets/icons/profile-agent-icon.svg); mask-image: url(/resource/regrelloAssets/icons/profile-agent-icon.svg); background-color: #9333ea;'
        }
    ],
    availableAgents: [
        { id: '1', label: 'AI Agent BETA', type: 'agent', desc: 'Automates tasks by analyzing and transforming data, generating documents and synthetizing information' },
        { id: '2', label: 'Document Agent', type: 'agent', desc: 'Extracts structured data from documents, fills .docx templates, and generates PDFs' },
        { id: '3', label: 'Document Reader Agent', type: 'agent', desc: 'Extracts fields and tables from documents' },
        { id: '4', label: 'Docusign Agent', type: 'agent', desc: 'Makes fast decisions and routes tasks without calling any tools' },
        { id: '5', label: 'Excel Agent BETA', type: 'agent', desc: 'Reads inputs from and writes outpust to Excel spreadsheets' },
        { id: '6', label: 'Regrello Agent', type: 'agent', desc: 'Handles general purpose tasks including calculations and data source searches' }
    ],
    activeDropdownTab: 'AI AGENTS',
    availableTeams: [
        { id: 'team-1', label: 'Onboarding', type: 'team', desc: 'Handles service provider intake and initial setup.' },
        { id: 'team-2', label: 'Compliance', type: 'team', desc: 'Verifies regulatory and internal policy adherence.' },
        { id: 'team-3', label: 'Finance', type: 'team', desc: 'Manages budget approvals and ERP integrations.' },
        { id: 'team-4', label: 'Legal', type: 'team', desc: 'Reviews contracts and manages legal risk.' }
    ],
    startAfterOptions: [
        { key: '1', value: 'Analyze Draft Contract for Approval', label: 'Analyze Draft Contract for Approval' },
        { key: '2', value: 'Generate Draft Contract', label: 'Generate Draft Contract' },
        { key: '3', value: 'Certification Check', label: 'Certification Check' }
    ]
};

const SIDEBAR_TEXT = {
    shortcutButtonText: 'Dell Agentforce Process Automation',
    userAvatarText: 'RM',
    userName: 'Ravi Mehta'
};

const CONFIGS = {
    Dell: {
        generateBlueprint: GENERATE_BLUEPRINT_CONFIG,
        supplierBlueprint: SUPPLIER_BLUEPRINT_CONFIG,
        editModal: { state: EDIT_MODAL_STATE },
        sidebar: { text: SIDEBAR_TEXT }
    }
};

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function resolveConfigName(configName) {
    if (configName && CONFIGS[configName]) {
        return configName;
    }
    const fallback = Object.keys(CONFIGS).find((key) => key.toLowerCase() === (configName || '').toLowerCase());
    return fallback || 'Dell';
}

export function getConfigByName(configName) {
    return CONFIGS[resolveConfigName(configName)];
}

export function getGenerateBlueprintConfig(configName) {
    return deepClone(getConfigByName(configName).generateBlueprint);
}

export function getSupplierBlueprintConfig(configName) {
    return deepClone(getConfigByName(configName).supplierBlueprint);
}

export function getEditModalStateConfig(configName) {
    return deepClone(getConfigByName(configName).editModal.state);
}

export function getSidebarTextConfig(configName) {
    return deepClone(getConfigByName(configName).sidebar.text);
}
