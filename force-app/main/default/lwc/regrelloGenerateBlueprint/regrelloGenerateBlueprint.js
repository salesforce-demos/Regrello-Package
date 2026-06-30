import { LightningElement, track } from 'lwc';
import regrelloAssetsUrl from '@salesforce/resourceUrl/regrelloAssets';

const INDUSTRY_OPTIONS = [
    'Automotive', 'Consumer Packaged Goods', 'Electronics', 'Fashion',
    'Healthcare', 'Oil and Gas', 'Pharmaceuticals', 'Software'
];

const BLUEPRINT_SECTION_TITLES = [
    'Document Submission',
    'Document Processing and Verification',
    'Compliance Review',
    'Contract Generation and Approval',
    'Finance Approval',
    'Legal Review',
    'Contract Execution',
    'Onboarding and Provisioning',
    'IT Escalation Review'
];

const SECTION_ROWS = {
    'Document Submission': [
        { title: 'Submit Onboarding Forms', assignee: 'Service Provider Partner', startsDetail: 'When the stage starts', timeToComplete: '3 days' }
    ],
    'Document Processing and Verification': [
        { title: 'Extract Insurance Details from Document', assignee: 'Document Agent', startsDetail: 'after Extract Tax Details from...', timeToComplete: 'No due date set' },
        { title: 'Extract Tax Details from Document', assignee: 'Document Agent', startsDetail: 'When the stage starts', timeToComplete: 'No due date set' },
        { title: 'Extract Compliance Details from Form', assignee: 'Document Agent', startsDetail: 'after Extract Insurance Detail...', timeToComplete: 'No due date set' },
        { title: 'Validate Form Completeness', assignee: 'Excel Agent', startsDetail: 'after Extract Compliance Det...', timeToComplete: 'No due date set' },
        { title: 'Check Against Procurement Data', assignee: 'Onboarding', startsDetail: 'When the stage starts', timeToComplete: '1 day' }
    ],
    'Compliance Review': [
        { title: 'Compliance Review', assignee: 'Compliance', startsDetail: 'When the stage starts', timeToComplete: '2 days' }
    ],
    'Contract Generation and Approval': [
        { title: 'Generate Draft Contract', assignee: 'Document Agent', startsDetail: 'When the stage starts', timeToComplete: 'No due date set' },
        { title: 'Analyze Draft Contract for Approval', assignee: 'Excel Agent', startsDetail: 'after Generate Draft Contract', timeToComplete: 'No due date set' },
        { title: 'Review and Approve Contract', assignee: 'Document Agent', startsDetail: 'after Analyze Draft Contract f...', timeToComplete: '1 day' }
    ],
    'Finance Approval': [
        { title: 'Finance Team Contract Approval', assignee: 'Finance', startsDetail: 'When the stage starts', timeToComplete: '2 days' }
    ],
    'Legal Review': [
        { title: 'Legal Team Contract Review', assignee: 'Legal', startsDetail: 'When the stage starts', timeToComplete: 'No due date set' }
    ],
    'Contract Execution': [
        { title: 'Send Contract to Service Provider', assignee: 'None', startsDetail: 'When the stage starts', timeToComplete: '1 day' },
        { title: 'Sign Contract', assignee: 'Service Provider Partner', startsDetail: 'after Send Contract to Servic...', timeToComplete: '5 days' }
    ],
    'Onboarding and Provisioning': [
        { title: 'Conduct Onboarding Training & Verify Certificate', assignee: 'Onboarding Team', startsDetail: 'When the stage starts', timeToComplete: '1 day' },
        { title: 'IT System Provisioning', assignee: 'IT Team', startsDetail: 'after Conduct Onboarding Tr...', timeToComplete: '1 day' }
    ],
    'IT Escalation Review': [
        { title: 'IT Escalation Review', assignee: 'IT Team', startsDetail: 'When the stage starts', timeToComplete: '1 day' }
    ]
};

const SECTION_HEADER_STARTS = {
    'Document Submission': { label: 'when the workflow starts', asLink: false },
    'Document Processing and Verification': { label: 'after the previous stage', asLink: false },
    'Compliance Review': { label: 'when 1 condition is met', asLink: true },
    'Contract Generation and Approval': { label: 'after the previous stage', asLink: false },
    'Finance Approval': { label: 'when 2 conditions are met', asLink: true },
    'Legal Review': { label: 'when 1 condition is met', asLink: true },
    'Contract Execution': { label: 'when 1 condition is met', asLink: true },
    'Onboarding and Provisioning': { label: 'after the previous stage', asLink: false },
    'IT Escalation Review': { label: 'when 1 condition is met', asLink: true }
};

const FORM_STAGES = [
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
];

const STEPS = ['Provide inputs', 'Generate blueprint', 'Generate forms', 'Finalize import', 'Summary'];

export default class RegrelloGenerateBlueprint extends LightningElement {
    // Form state
    @track name = '';
    @track industry = '';
    @track processDescription = '';
    @track files = [];
    @track isDragging = false;
    @track industryOpen = false;

    // Flow state
    @track flowPhase = 'form'; // 'form' | 'generating'
    @track subStep = 'blueprint'; // 'blueprint' | 'forms' | ... | 'importFinalize' | 'summary'
    @track formStageIndex = 0; // which FORM_STAGES entry we're on

    // Blueprint generation animation
    @track submittedName = '';
    @track typedTitle = '';
    @track titleTypingStarted = false;
    @track visibleSectionCount = 0;
    @track sections = [];
    @track showLoader = false;

    // Form stage animation
    @track formStageTitle = '';
    @track formStageTypedTitle = '';
    @track formStageTitleStarted = false;
    @track formStagePaddedBox = false;
    @track formStageVisibleFields = 0;
    @track formStageFields = [];

    _timers = [];

    get generateIconStyle() {
        const url = `${regrelloAssetsUrl}/icons/generate-icon.svg`;
        return `background-color:#0f172a;-webkit-mask-image:url(${url});mask-image:url(${url});-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;display:inline-block;width:22px;height:22px;flex-shrink:0;`;
    }

    get paperclipIconStyle() {
        const url = `${regrelloAssetsUrl}/icons/paperclip-icon.svg`;
        return `background-color:#0176d3;-webkit-mask-image:url(${url});mask-image:url(${url});-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;display:inline-block;width:32px;height:32px;flex-shrink:0;`;
    }

    get paperclipSmallIconStyle() {
        const url = `${regrelloAssetsUrl}/icons/paperclip-icon.svg`;
        return `background-color:#0176d3;-webkit-mask-image:url(${url});mask-image:url(${url});-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;display:inline-block;width:24px;height:24px;flex-shrink:0;`;
    }

    get downloadIconStyle() {
        const url = `${regrelloAssetsUrl}/icons/download-icon.svg`;
        return `background-color:#64748b;-webkit-mask-image:url(${url});mask-image:url(${url});-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;display:inline-block;width:16px;height:16px;flex-shrink:0;`;
    }

    get templateDownloadUrl() {
        return `${regrelloAssetsUrl}/templates/blueprint-upload-template.xlsx`;
    }

    get industryOptions() {
        return INDUSTRY_OPTIONS.map(opt => ({
            value: opt,
            key: opt,
            isSelected: this.industry === opt
        }));
    }

    get industryHasValue() {
        return this.industry.length > 0;
    }

    get canGenerate() {
        const hasName = this.name.trim().length > 0;
        const hasIndustry = this.industry.length > 0;
        const hasDescription = this.processDescription.trim().length > 0;
        const hasFiles = this.files.length > 0;
        return hasName && hasIndustry && (hasDescription || hasFiles);
    }

    get generateBtnClass() {
        return `generate-btn${this.canGenerate ? '' : ' generate-btn--disabled'}`;
    }

    get stepperSteps() {
        const activeIndex = this._stepperActiveIndex();
        return STEPS.map((label, i) => ({
            key: label,
            label,
            isDone: i < activeIndex,
            isActive: i === activeIndex,
            isPending: i > activeIndex,
            circleClass: i < activeIndex
                ? 'step-circle step-circle--done'
                : i === activeIndex
                    ? 'step-circle step-circle--active'
                    : 'step-circle step-circle--pending',
            labelClass: i === activeIndex
                ? 'step-label step-label--active'
                : i < activeIndex
                    ? 'step-label step-label--done'
                    : 'step-label step-label--pending',
            number: i + 1,
            // Left half-connector (between previous circle and this one)
            showLeftSpacer:    i === 0,
            showLeftConnector: i > 0,
            leftConnectorClass: activeIndex >= i
                ? 'step-connector step-connector--done' : 'step-connector',
            // Right half-connector (between this circle and the next one)
            showRightConnector: i < STEPS.length - 1,
            showRightSpacer:    i === STEPS.length - 1,
            rightConnectorClass: activeIndex >= i + 1
                ? 'step-connector step-connector--done' : 'step-connector'
        }));
    }

    _stepperActiveIndex() {
        if (this.flowPhase === 'form') return 0;
        if (this.subStep === 'blueprint') return 1;
        if (this.subStep === 'importFinalize') return 3;
        if (this.subStep === 'summary') return 4;
        return 2;
    }

    get isFormPhase() { return this.flowPhase === 'form'; }
    get isBlueprintStep() { return this.flowPhase === 'generating' && this.subStep === 'blueprint'; }
    get isFormStageStep() {
        return this.flowPhase === 'generating' && !['blueprint', 'importFinalize', 'summary'].includes(this.subStep);
    }
    get isFinalizeStep() {
        return this.flowPhase === 'generating' && (this.subStep === 'importFinalize' || this.subStep === 'summary');
    }
    get showGeneratingLoader() {
        return this.flowPhase === 'generating' && !['importFinalize', 'summary'].includes(this.subStep);
    }

    get visibleBlueprintSections() {
        // Show section cards once stagger has revealed them; the section card itself shows a skeleton when visibleRowCount=0
        return this.sections.slice(0, this.visibleSectionCount);
    }

    get hasVisibleSections() {
        return this.visibleSectionCount > 0;
    }

    get showBlueprintSkeleton() {
        // Show big skeleton only before section cards start staggering in
        return this.isBlueprintStep && this.visibleSectionCount === 0;
    }

    get showBlueprintSections() {
        return this.isBlueprintStep && this.hasVisibleSections;
    }

    get titleToShow() {
        return this.typedTitle;
    }

    get showTitleSkeleton() {
        return this.isBlueprintStep && !this.titleTypingStarted;
    }

    get showTitleText() {
        return this.isBlueprintStep && this.titleTypingStarted;
    }

    get showFinalizeSpinner() {
        return this.subStep === 'importFinalize';
    }

    get formStageVisibleFieldsList() {
        return this.formStageFields
            .slice(0, this.formStageVisibleFields)
            .map((f, i) => ({
                ...f,
                key: f.id,
                isText: f.type === 'text' || f.type === 'tel',
                isSelect: f.type === 'select',
                isUpload: f.type === 'upload',
                options: (f.options || []).map(o => ({ value: o, label: o, key: o }))
            }));
    }

    get showFormStageSkeleton() {
        return !this.formStagePaddedBox;
    }

    get showFormStageFieldSkeleton() {
        return this.formStagePaddedBox && this.formStageVisibleFields === 0;
    }

    get showFormStagePaddedBox() {
        return this.formStagePaddedBox;
    }

    get showFormStageTitleSkeleton() {
        return !this.formStageTitleStarted;
    }

    get uploadIconStyle() {
        return `color:#0176d3;font-size:24px;`;
    }

    // --- File handling ---
    handleNameInput(event) {
        this.name = event.target.value;
    }

    handleProcessDescriptionInput(event) {
        this.processDescription = event.target.value;
    }

    handleIndustryToggle() {
        this.industryOpen = !this.industryOpen;
    }

    handleIndustrySelect(event) {
        this.industry = event.currentTarget.dataset.value;
        this.industryOpen = false;
    }

    handleDragOver(event) {
        event.preventDefault();
        this.isDragging = true;
    }

    handleDragLeave() {
        this.isDragging = false;
    }

    handleDrop(event) {
        event.preventDefault();
        this.isDragging = false;
        const fileList = event.dataTransfer.files;
        if (fileList && fileList.length) {
            this._addFiles(Array.from(fileList));
        }
    }

    handleFileChange(event) {
        const fileList = event.target.files;
        if (fileList && fileList.length) {
            this._addFiles(Array.from(fileList));
        }
        event.target.value = '';
    }

    handleFilePickerClick() {
        const input = this.template.querySelector('.file-input');
        if (input) input.click();
    }

    handleRemoveFile(event) {
        const idx = parseInt(event.currentTarget.dataset.index, 10);
        this.files = this.files.filter((_, i) => i !== idx);
    }

    _addFiles(newFiles) {
        const seen = new Set(this.files.map(f => `${f.name}-${f.size}`));
        const merged = [...this.files];
        for (const f of newFiles) {
            const key = `${f.name}-${f.size}`;
            if (!seen.has(key)) {
                seen.add(key);
                merged.push({ name: f.name, size: f.size, key: `${f.name}-${f.size}` });
            }
        }
        this.files = merged;
    }

    get dropZoneClass() {
        return `drop-zone${this.isDragging ? ' drop-zone--dragging' : ''}`;
    }

    get hasFiles() {
        return this.files.length > 0;
    }

    get fileList() {
        return this.files.map((f, i) => ({ ...f, key: f.key || `${f.name}-${i}`, index: i }));
    }

    // --- Generate flow ---
    handleGenerate() {
        if (!this.canGenerate) return;
        this._clearTimers();

        this.submittedName = this.name.trim();
        this.typedTitle = '';
        this.titleTypingStarted = false;
        this.visibleSectionCount = 0;
        this.sections = BLUEPRINT_SECTION_TITLES.map(t => ({
            key: t, title: t,
            visibleRowCount: 0,
            headerStartsReady: false,
            label: SECTION_HEADER_STARTS[t].label,
            asLink: SECTION_HEADER_STARTS[t].asLink
        }));
        this.subStep = 'blueprint';
        this.showLoader = true;
        this.flowPhase = 'generating';

        // 5s → start typing title
        this._addTimer(setTimeout(() => this._startBlueprintTitleTyping(), 5000));
    }

    _startBlueprintTitleTyping() {
        this.titleTypingStarted = true;
        const full = this.submittedName;
        let charIdx = 0;
        const interval = setInterval(() => {
            charIdx++;
            this.typedTitle = full.slice(0, charIdx);
            if (charIdx >= full.length) {
                clearInterval(interval);
                // 3s after typing done → stagger section cards
                this._addTimer(setTimeout(() => this._staggerSectionCards(), 3000));
            }
        }, 1000 / full.length || 50);
        this._addTimer(interval);
    }

    _staggerSectionCards() {
        let t = 0;
        BLUEPRINT_SECTION_TITLES.forEach((title, sIdx) => {
            this._addTimer(setTimeout(() => {
                this.visibleSectionCount = sIdx + 1;
                this.sections = this.sections.map((s, i) => i === sIdx
                    ? { ...s }
                    : s
                );
            }, t));
            t += 450;
        });

        // After all sections visible, animate rows
        const afterAllSections = t;
        this._addTimer(setTimeout(() => this._animateSectionRows(), afterAllSections));
    }

    _animateSectionRows() {
        let t = 0;
        const LIST_STAGGER = 400;
        const HEADER_DELAY = 500;
        const GAP_NEXT = 1000;

        BLUEPRINT_SECTION_TITLES.forEach((title, sIdx) => {
            const rows = SECTION_ROWS[title];
            rows.forEach((_, rIdx) => {
                this._addTimer(setTimeout(() => {
                    this.sections = this.sections.map((s, i) =>
                        i === sIdx ? { ...s, visibleRowCount: rIdx + 1 } : s
                    );
                }, t));
                if (rIdx < rows.length - 1) t += LIST_STAGGER;
            });
            const tLastRow = t;
            this._addTimer(setTimeout(() => {
                this.sections = this.sections.map((s, i) =>
                    i === sIdx ? { ...s, headerStartsReady: true } : s
                );
            }, tLastRow + HEADER_DELAY));
            if (sIdx < BLUEPRINT_SECTION_TITLES.length - 1) {
                t = tLastRow + GAP_NEXT;
            }
        });

        // After all sections done, wait 3s → move to first form stage
        const totalDone = t + HEADER_DELAY + 3000;
        this._addTimer(setTimeout(() => {
            this.formStageIndex = 0;
            this._startFormStage(0);
        }, totalDone));
    }

    _startFormStage(idx) {
        if (idx >= FORM_STAGES.length) {
            // All form stages done → go to finalize
            this.subStep = 'importFinalize';
            this._addTimer(setTimeout(() => {
                this.subStep = 'summary';
                this._addTimer(setTimeout(() => {
                    this.dispatchEvent(new CustomEvent('openblueprintdetail', {
                        detail: {
                            name: this.submittedName,
                            processDescription: this.processDescription.trim()
                        }
                    }));
                }, 1000));
            }, 5000));
            return;
        }

        const stage = FORM_STAGES[idx];
        this.subStep = stage.id;
        this.formStageTitle = stage.title;
        this.formStageFields = stage.fields;
        this.formStageTypedTitle = '';
        this.formStageTitleStarted = false;
        this.formStagePaddedBox = false;
        this.formStageVisibleFields = 0;

        // Title typing
        this._addTimer(setTimeout(() => {
            this.formStageTitleStarted = true;
            const full = stage.title;
            let charIdx = 0;
            const interval = setInterval(() => {
                charIdx++;
                this.formStageTypedTitle = full.slice(0, charIdx);
                if (charIdx >= full.length) clearInterval(interval);
            }, 1000 / full.length || 40);
            this._addTimer(interval);
        }, 1000));

        // Padded box
        this._addTimer(setTimeout(() => { this.formStagePaddedBox = true; }, 1500));

        // Fields stagger
        const firstFieldAt = 1500 + 1000;
        stage.fields.forEach((_, i) => {
            this._addTimer(setTimeout(() => {
                this.formStageVisibleFields = i + 1;
            }, firstFieldAt + i * 350));
        });

        // After last field + 3s → move to next stage
        const doneAt = firstFieldAt + stage.fields.length * 350 + 3000;
        this._addTimer(setTimeout(() => {
            this._startFormStage(idx + 1);
        }, doneAt));
    }

    _addTimer(id) {
        this._timers.push(id);
        return id;
    }

    _clearTimers() {
        this._timers.forEach(id => {
            clearTimeout(id);
            clearInterval(id);
        });
        this._timers = [];
    }

    disconnectedCallback() {
        this._clearTimers();
    }
}