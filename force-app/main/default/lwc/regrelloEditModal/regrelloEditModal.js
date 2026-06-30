import { LightningElement, api, track } from 'lwc';
import regrelloAssetsUrl from '@salesforce/resourceUrl/regrelloAssets';

export default class RegrelloEditModal extends LightningElement {
    @api open = false;
    @api taskName = 'Review and Approve Contract'; // Default from screenshot
    @api assigneeLabel = 'Legal';
    /** Raw assignee string from the task row (used to build pills when the modal opens). */
    @api assigneeName = '';
    @api assigneeIsAgent = false;
    @api startPrimary = '';
    @api startAfterTask = '';
    @api dueAmount = '';
    @api dueUnit = 'Days';
    @api descriptionText = '';

    @track activeTab = 'configure';
    @track localName = '';
    @track localDescription = 'Review the draft contract and the provided recommendation. Based on your assessment, decide whether to approve the contract, reject it, or escalate it to the legal team for further review.';
    @track localDueAmount = '1';
    @track localDueUnit = 'Days';
    @track localStartPrimary = 'After another task ends';
    @track localStartAfterTask = 'Analyze Draft Contract for Approval';
    @track assignees = [
        {
            id: 'team-4',
            label: 'Legal',
            isLetterIcon: true,
            iconText: 'L',
            iconStyle: 'background-color: var(--brand-blue); color: #fff;'
        }
    ];
    @track showDropdown = false;
    @track availableAgents = [
        { id: '1', label: 'AI Agent BETA', type: 'agent', iconStyle: `-webkit-mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); background-color: #9333ea;`, desc: 'Automates tasks by analyzing and transforming data, generating documents and synthetizing information' },
        { id: '2', label: 'Document Agent', type: 'agent', iconStyle: `-webkit-mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); background-color: #9333ea;`, desc: 'Extracts structured data from documents, fills .docx templates, and generates PDFs' },
        { id: '3', label: 'Document Reader Agent', type: 'agent', iconStyle: `-webkit-mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); background-color: #9333ea;`, desc: 'Extracts fields and tables from documents' },
        { id: '4', label: 'Docusign Agent', type: 'agent', iconStyle: `-webkit-mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); background-color: #9333ea;`, desc: 'Makes fast decisions and routes tasks without calling any tools' },
        { id: '5', label: 'Excel Agent BETA', type: 'agent', iconStyle: `-webkit-mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); background-color: #9333ea;`, desc: 'Reads inputs from and writes outpust to Excel spreadsheets' },
        { id: '6', label: 'Regrello Agent', type: 'agent', iconStyle: `-webkit-mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); background-color: #9333ea;`, desc: 'Handles general purpose tasks including calculations and data source searches' }
    ];
    @track activeDropdownTab = 'AI AGENTS'; // Default tab
    @track availableTeams = [
        { id: 'team-1', label: 'Onboarding', type: 'team', desc: 'Handles service provider intake and initial setup.' },
        { id: 'team-2', label: 'Compliance', type: 'team', desc: 'Verifies regulatory and internal policy adherence.' },
        { id: 'team-3', label: 'Finance', type: 'team', desc: 'Manages budget approvals and ERP integrations.' },
        { id: 'team-4', label: 'Legal', type: 'team', desc: 'Reviews contracts and manages legal risk.' }
    ];

    _prevOpen = false;

    connectedCallback() {
        this.localName = this.taskName;
    }

    renderedCallback() {
        if (this.open && !this._prevOpen) {
            this.hydrateFromParent();
        }
        this._prevOpen = this.open;
    }

    hydrateFromParent() {
        this.localName = this.taskName || '';
        this.localDescription = this.descriptionText || this.localDescription;
        this.localDueAmount = this.dueAmount !== undefined && this.dueAmount !== null && this.dueAmount !== ''
            ? String(this.dueAmount)
            : '1';
        this.localDueUnit = this.dueUnit || 'Days';
        this.localStartPrimary = this.startPrimary || this.localStartPrimary;
        this.localStartAfterTask = this.startAfterTask || this.localStartAfterTask;
        const raw = (this.assigneeName || this.assigneeLabel || '').replace(/\s+004$/i, '').trim();
        if (raw.includes(',')) {
            const pills = raw
                .split(',')
                .map((segment) => segment.trim())
                .filter(Boolean)
                .map((s) => this.buildPillForSeed(s, s.toLowerCase().includes('agent')));
            this.assignees = pills.length ? pills : [this.buildPillForSeed('', false)];
        } else {
            this.assignees = [this.buildPillForSeed(raw, this.assigneeIsAgent)];
        }
    }

    /**
     * Build one assignee pill from the task row assignee string (matches agents / teams / generic human).
     */
    buildPillForSeed(label, isAgent) {
        const normalized = (label || '').trim();
        if (!normalized) {
            return {
                id: 'empty',
                label: '',
                isLetterIcon: false,
                iconStyle: `-webkit-mask-image: url(${regrelloAssetsUrl}/icons/profile-icon.svg); mask-image: url(${regrelloAssetsUrl}/icons/profile-icon.svg); background-color: #1e293b;`
            };
        }

        const teamMatch = [...this.availableTeams]
            .sort((a, b) => b.label.length - a.label.length)
            .find(
                (t) =>
                    normalized.toLowerCase() === t.label.toLowerCase() ||
                    normalized.toLowerCase().startsWith(`${t.label.toLowerCase()} `)
            );
        if (teamMatch) {
            return {
                id: teamMatch.id,
                label: teamMatch.label,
                isLetterIcon: true,
                iconText: teamMatch.label.charAt(0).toUpperCase(),
                iconStyle: 'background-color: var(--brand-blue); color: #fff;'
            };
        }

        const agentMatch = this.availableAgents.find((a) => a.label === normalized);
        if (agentMatch && (isAgent || normalized.toLowerCase().includes('agent'))) {
            return {
                id: agentMatch.id,
                label: agentMatch.label,
                isLetterIcon: false,
                iconStyle: agentMatch.iconStyle
            };
        }

        if (isAgent || normalized.toLowerCase().includes('agent')) {
            return {
                id: `agent-${normalized}`,
                label: normalized,
                isLetterIcon: false,
                iconStyle: `-webkit-mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); background-color: #9333ea;`
            };
        }

        return {
            id: `human-${normalized}`,
            label: normalized,
            isLetterIcon: false,
            iconStyle: `-webkit-mask-image: url(${regrelloAssetsUrl}/icons/profile-icon.svg); mask-image: url(${regrelloAssetsUrl}/icons/profile-icon.svg); background-color: #1e293b;`
        };
    }

    get dropdownTabs() {
        const tabs = ['ALL', 'ROLES', 'PEOPLE', 'TEAMS', 'AI AGENTS'];
        return tabs.map(tab => ({
            label: tab,
            class: tab === this.activeDropdownTab ? 'tab-item active' : 'tab-item'
        }));
    }

    get filteredItems() {
        let items = [];
        const isTeamTab = this.activeDropdownTab === 'TEAMS';

        if (this.activeDropdownTab === 'AI AGENTS') {
            items = this.availableAgents;
        } else if (isTeamTab) {
            items = this.availableTeams;
        }
        
        return items.map(item => {
            const baseItem = { ...item };
            if (isTeamTab) {
                // Team logic: use first letter on blue circle (matches SLDS / Teams styling)
                baseItem.isLetterIcon = true;
                baseItem.iconText = item.label ? item.label.charAt(0).toUpperCase() : '';
                baseItem.iconStyle = 'background-color: var(--brand-blue); color: #fff;';
            } else {
                // Agent logic: use SVG mask
                baseItem.isLetterIcon = false;
                baseItem.iconStyle = `-webkit-mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); background-color: #9333ea;`;
            }
            return baseItem;
        });
    }

    // Class getters
    get assigneeChipClass() {
        return 'assignee-pill';
    }

    get dropdownClass() {
        return this.showDropdown ? 'assignee-dropdown show' : 'assignee-dropdown';
    }

    get showDialog() { return this.open; }
    get showConfigurePanel() { return this.activeTab === 'configure'; }
    get showStartAfterRow() { return this.localStartPrimary === 'After another task ends'; }

    get tabConfigureClass() { 
        return this.activeTab === 'configure' ? 'modal-tab modal-tab--active' : 'modal-tab'; 
    }
    
    get tabTestClass() { 
        return this.activeTab === 'test' ? 'modal-tab modal-tab--active' : 'modal-tab'; 
    }

    get startAfterOptions() {
        return [
            { key: '1', value: 'Analyze Draft Contract for Approval', label: 'Analyze Draft Contract for Approval' },
            { key: '2', value: 'Generate Draft Contract', label: 'Generate Draft Contract' },
            { key: '3', value: 'Certification Check', label: 'Certification Check' }
        ];
    }

    // Handlers for the buttons
    handleRemoveAssignee(event) {
        const idToRemove = event.target.dataset.id;
        this.assignees = this.assignees.filter(item => item.id !== idToRemove);
    }

    handleClearAll() {
        this.assignees = [];
    }

    handleToggleDropdown(event) {
        // Stop the click from bubbling up to parents
        event.stopPropagation(); 
        this.showDropdown = !this.showDropdown;
    }

    // Add this to close the dropdown when clicking the backdrop
    handleBackdropClick() {
        this.showDropdown = false;
        this.handleClose();
    }

    handleStartPrimaryChange(event) {
        this.localStartPrimary = event.target.value;
    }

    handleStartAfterChange(event) {
        this.localStartAfterTask = event.target.value;
    }

    // Logic for Start/Due/Name remains largely the same, ensuring UI sync
    handleTabConfigure() { this.activeTab = 'configure'; }
    handleTabTest() { this.activeTab = 'test'; }

    // Ensure buttons update the value correctly
    handleDueIncrease() {
        this.localDueAmount = String(Number(this.localDueAmount || 0) + 1);
    }

    handleDueDecrease() {
        const current = Number(this.localDueAmount || 0);
        if (current > 1) {
            this.localDueAmount = String(current - 1);
        }
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleNameInput(event) {
        this.localName = event.target.value;
    }

    handleDescriptionInput(event) {
        this.localDescription = event.detail?.value ?? event.target?.value ?? '';
    }

    handleSave() {
        const labels = this.assignees.map((a) => a.label).filter(Boolean);
        const assignee = labels.join(', ');
        this.dispatchEvent(
            new CustomEvent('save', {
                bubbles: true,
                composed: true,
                detail: {
                    taskName: this.localName,
                    assignee
                }
            })
        );
    }

    handleSelectAssignee(event) {
        const selectedId = event.currentTarget.dataset.id;
        const item = [...this.availableAgents, ...this.availableTeams].find(i => i.id === selectedId);

        if (item && !this.assignees.some(a => a.id === selectedId)) {
            const isTeam = item.id.includes('team');
            
            this.assignees = [...this.assignees, { 
                id: item.id, 
                label: item.label,
                isLetterIcon: isTeam,
                iconText: isTeam ? item.label.charAt(0).toUpperCase() : '',
                // Team: blue letter circle; agent: purple mask icon
                iconStyle: isTeam
                    ? 'background-color: var(--brand-blue); color: #fff;'
                    : `-webkit-mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); background-color: white;`
            }];
        }
        this.showDropdown = false;
    }

    handleDropdownTabClick(event) {
        this.activeDropdownTab = event.target.dataset.label;
    }
}