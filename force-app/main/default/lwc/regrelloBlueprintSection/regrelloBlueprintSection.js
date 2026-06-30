import { LightningElement, api, track } from 'lwc';
import regrelloAssetsUrl from '@salesforce/resourceUrl/regrelloAssets';

const MODAL_SAMPLE_DESCRIPTION =
    'Review the draft contract and the provided recommendation. Based on your assessment, decide whether to approve the contract, reject it, or escalate it to the legal team for further review.';

function parseTimeToComplete(value) {
    if (!value || value === 'No due date set') {
        return { amount: '1', unit: 'Days' };
    }
    const match = value.match(/^(\d+)\s+/);
    if (!match) {
        return { amount: '1', unit: 'Days' };
    }
    const amount = match[1];
    const unit = /hour/i.test(value) ? 'Hours' : 'Days';
    return { amount, unit };
}

function deriveStartPrimary(startsDetail) {
    const text = (startsDetail || '').toLowerCase();
    if (text.includes('when the stage')) {
        return 'When the stage starts';
    }
    return 'After another task ends';
}

function deriveStartAfterTask(startsDetail) {
    const raw = startsDetail || '';
    const lower = raw.toLowerCase();
    if (lower.startsWith('after ')) {
        return raw.slice(6).trim();
    }
    return 'Analyze Draft Contract for Approval';
}

function formatAssigneeDisplay(assignee) {
    if (!assignee) {
        return '';
    }
    return assignee
        .split(',')
        .map((part) => {
            const p = part.trim();
            if (!p) {
                return '';
            }
            if (p.toLowerCase().includes('agent')) {
                return `${p} 004`;
            }
            return p;
        })
        .filter(Boolean)
        .join(', ');
}

/** Visual bucket for assignee chip + icon (mask SVG vs department initial). */
function getAssigneeCategory(assignee) {
    const a = (assignee || '').toLowerCase();
    if (a.includes('agent')) {
        return 'agent';
    }
    if (a.includes('onboarding')) {
        return 'onboarding';
    }
    if (a.includes('compliance')) {
        return 'compliance';
    }
    if (a.includes('finance')) {
        return 'finance';
    }
    if (a.includes('legal')) {
        return 'legal';
    }
    return 'human';
}

const CATEGORY_ICON = {
    agent: { maskColor: '#581c87', iconFile: 'profile-agent-icon' },
    onboarding: { letter: 'O' },
    compliance: { letter: 'C' },
    finance: { letter: 'F' },
    legal: { letter: 'L' },
    human: { maskColor: '#1e293b', iconFile: 'profile-icon' }
};

function buildAssigneeIconStyle(category) {
    const spec = CATEGORY_ICON[category] || CATEGORY_ICON.human;
    if (spec.letter) {
        return '';
    }
    const { maskColor, iconFile } = spec;
    const url = `${regrelloAssetsUrl}/icons/${iconFile}.svg`;
    return `background-color:${maskColor};-webkit-mask-image:url(${url});mask-image:url(${url});-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;`;
}

function assigneeChipClass(category) {
    if (category === 'agent') {
        return 'assignee-chip assignee-chip--agent';
    }
    if (category === 'human') {
        return 'assignee-chip assignee-chip--human';
    }
    return `assignee-chip assignee-chip--${category}`;
}

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

function maskIconStyle(iconFile, color = '#475569') {
    const url = `${regrelloAssetsUrl}/icons/${iconFile}.svg`;
    return `background-color:${color};-webkit-mask-image:url(${url});mask-image:url(${url});-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;display:inline-block;width:16px;height:16px;flex-shrink:0;`;
}

export default class RegrelloBlueprintSection extends LightningElement {
    @api title = '';
    @api visibleRowCount = 0;
    @api headerStartsReady = false;

    /** Task title → assignee string overrides after modal save */
    @track assigneeOverrides = {};

    /** Row task title currently being edited (stable key for overrides). */
    editingTaskTitle = '';

    @track showEditModal = false;

    modalTaskName = '';

    modalAssigneeLabel = '';

    modalAssigneeName = '';

    modalAssigneeIsAgent = false;

    modalStartPrimary = 'After another task ends';

    modalStartAfterTask = '';

    modalDueAmount = '1';

    modalDueUnit = 'Days';

    modalDescriptionText = MODAL_SAMPLE_DESCRIPTION;

    get chevronStyle() {
        const url = `${regrelloAssetsUrl}/icons/carat-left-icon.svg`;
        return `background-color:#64748b;-webkit-mask-image:url(${url});mask-image:url(${url});-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;display:inline-block;width:12px;height:12px;flex-shrink:0;transform:rotate(-90deg);`;
    }

    get editActionIconStyle() {
        return maskIconStyle('edit-icon');
    }

    get documentActionIconStyle() {
        return maskIconStyle('documents-icon');
    }

    get rows() {
        const allRows = SECTION_ROWS[this.title] || [];
        return allRows.slice(0, this.visibleRowCount).map(row => {
            const effectiveAssignee = this.assigneeOverrides[row.title] ?? row.assignee;
            const primaryAssignee = effectiveAssignee.split(',')[0].trim() || effectiveAssignee;
            const category = getAssigneeCategory(primaryAssignee);
            const titleText = row.title;
            const spec = CATEGORY_ICON[category] || CATEGORY_ICON.human;
            const assigneeIconUsesLetter = Boolean(spec.letter);
            return {
                ...row,
                assignee: effectiveAssignee,
                assigneeDisplay: formatAssigneeDisplay(effectiveAssignee),
                key: row.title,
                chipClass: assigneeChipClass(category),
                assigneeIconUsesLetter,
                assigneeIconLetter: assigneeIconUsesLetter ? spec.letter : '',
                assigneeIconLetterClass: assigneeIconUsesLetter
                    ? `assignee-icon assignee-icon--letter assignee-icon--${category}`
                    : 'assignee-icon',
                iconStyle: buildAssigneeIconStyle(category),
                toolbarAriaLabel: `Task actions for ${titleText}`,
                editAriaLabel: `Edit ${titleText}`,
                documentAriaLabel: `Open document for ${titleText}`,
                deleteAriaLabel: `Delete ${titleText}`
            };
        });
    }

    get startsLabel() {
        return this.headerMeta.label;
    }

    get startsIsLink() {
        return this.headerMeta.asLink;
    }

    get showSkeleton() {
        return this.visibleRowCount === 0;
    }

    get showRows() {
        return this.visibleRowCount > 0;
    }

    // Inside RegrelloBlueprintSection class
    get startsValueClass() {
        return this.startsIsLink 
            ? 'starts-value starts-value--link' 
            : 'starts-value';
    }

    // Ensure headerMeta logic matches your data
    get headerMeta() {
        // For "Supplier Approved", this returns { label: 'when 1 condition is met', asLink: true }
        return SECTION_HEADER_STARTS[this.title] || { label: '', asLink: false };
    }

    handleEditTask(event) {
        const taskTitle = event.currentTarget.dataset.taskTitle;
        const allRows = SECTION_ROWS[this.title] || [];
        const row = allRows.find((r) => r.title === taskTitle);
        if (!row) {
            return;
        }
        this.editingTaskTitle = row.title;
        const effectiveAssignee = this.assigneeOverrides[row.title] ?? row.assignee;
        const category = getAssigneeCategory(effectiveAssignee.split(',')[0].trim() || effectiveAssignee);
        const due = parseTimeToComplete(row.timeToComplete);
        this.modalTaskName = row.title;
        this.modalAssigneeName = effectiveAssignee;
        this.modalAssigneeLabel = formatAssigneeDisplay(effectiveAssignee);
        this.modalAssigneeIsAgent = category === 'agent';
        this.modalStartPrimary = deriveStartPrimary(row.startsDetail);
        this.modalStartAfterTask = deriveStartAfterTask(row.startsDetail);
        this.modalDueAmount = due.amount;
        this.modalDueUnit = due.unit;
        this.modalDescriptionText = MODAL_SAMPLE_DESCRIPTION;
        this.showEditModal = true;
    }

    handleEditModalClose() {
        this.showEditModal = false;
        this.editingTaskTitle = '';
    }

    handleEditModalSave(event) {
        const { assignee } = event.detail || {};
        if (this.editingTaskTitle) {
            this.assigneeOverrides = {
                ...this.assigneeOverrides,
                [this.editingTaskTitle]: assignee
            };
        }
        this.showEditModal = false;
        this.editingTaskTitle = '';
    }
}