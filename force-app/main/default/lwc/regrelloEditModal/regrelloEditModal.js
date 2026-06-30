import { LightningElement, api } from 'lwc';
import regrelloAssetsUrl from '@salesforce/resourceUrl/regrelloAssets';
import { getEditModalStateConfig } from 'c/regrelloConfigs';

export default class RegrelloEditModal extends LightningElement {
    @api configName = 'Dell';
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

    state = {};
    activeTab = 'configure';
    showDropdown = false;

    _prevOpen = false;

    connectedCallback() {
        this.state = getEditModalStateConfig(this.configName);
        this.state.localName = this.taskName;
    }

    renderedCallback() {
        if (this.open && !this._prevOpen) {
            this.hydrateFromParent();
        }
        this._prevOpen = this.open;
    }

    hydrateFromParent() {
        this.state.localName = this.taskName || '';
        this.state.localDescription = this.descriptionText || this.state.localDescription;
        this.state.localDueAmount = this.dueAmount !== undefined && this.dueAmount !== null && this.dueAmount !== ''
            ? String(this.dueAmount)
            : '1';
        this.state.localDueUnit = this.dueUnit || 'Days';
        this.state.localStartPrimary = this.startPrimary || this.state.localStartPrimary;
        this.state.localStartAfterTask = this.startAfterTask || this.state.localStartAfterTask;
        const raw = (this.assigneeName || this.assigneeLabel || '').replace(/\s+004$/i, '').trim();
        if (raw.includes(',')) {
            const pills = raw
                .split(',')
                .map((segment) => segment.trim())
                .filter(Boolean)
                .map((s) => this.buildPillForSeed(s, s.toLowerCase().includes('agent')));
            this.state.assignees = pills.length ? pills : [this.buildPillForSeed('', false)];
        } else {
            this.state.assignees = [this.buildPillForSeed(raw, this.assigneeIsAgent)];
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

        const teamMatch = [...this.state.availableTeams]
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
            class: tab === this.state.activeDropdownTab ? 'tab-item active' : 'tab-item'
        }));
    }

    get filteredItems() {
        let items = [];
        const isTeamTab = this.state.activeDropdownTab === 'TEAMS';

        if (this.state.activeDropdownTab === 'AI AGENTS') {
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
    get showStartAfterRow() { return this.state.localStartPrimary === 'After another task ends'; }

    get tabConfigureClass() { 
        return this.activeTab === 'configure' ? 'modal-tab modal-tab--active' : 'modal-tab'; 
    }
    
    get tabTestClass() { 
        return this.activeTab === 'test' ? 'modal-tab modal-tab--active' : 'modal-tab'; 
    }

    get startAfterOptions() {
        return this.state.startAfterOptions;
    }

    get localName() { return this.state.localName; }
    get localDescription() { return this.state.localDescription; }
    get localDueAmount() { return this.state.localDueAmount; }
    get localDueUnit() { return this.state.localDueUnit; }
    get localStartPrimary() { return this.state.localStartPrimary; }
    get localStartAfterTask() { return this.state.localStartAfterTask; }
    get assignees() { return this.state.assignees || []; }
    get availableAgents() {
        return (this.state.availableAgents || []).map((agent) => ({
            ...agent,
            iconStyle: `-webkit-mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); background-color: #9333ea;`
        }));
    }
    get availableTeams() { return this.state.availableTeams || []; }

    setState(partial) {
        this.state = { ...this.state, ...partial };
    }

    // Handlers for the buttons
    handleRemoveAssignee(event) {
        const idToRemove = event.target.dataset.id;
        this.setState({ assignees: this.assignees.filter(item => item.id !== idToRemove) });
    }

    handleClearAll() {
        this.setState({ assignees: [] });
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
        this.setState({ localStartPrimary: event.target.value });
    }

    handleStartAfterChange(event) {
        this.setState({ localStartAfterTask: event.target.value });
    }

    // Logic for Start/Due/Name remains largely the same, ensuring UI sync
    handleTabConfigure() { this.activeTab = 'configure'; }
    handleTabTest() { this.activeTab = 'test'; }

    // Ensure buttons update the value correctly
    handleDueIncrease() {
        this.setState({ localDueAmount: String(Number(this.localDueAmount || 0) + 1) });
    }

    handleDueDecrease() {
        const current = Number(this.localDueAmount || 0);
        if (current > 1) {
            this.setState({ localDueAmount: String(current - 1) });
        }
    }

    handleDueInput(event) {
        this.setState({ localDueAmount: event.target.value });
    }

    handleDueUnitChange(event) {
        this.setState({ localDueUnit: event.target.value });
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleNameInput(event) {
        this.setState({ localName: event.target.value });
    }

    handleDescriptionInput(event) {
        this.setState({ localDescription: event.detail?.value ?? event.target?.value ?? '' });
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

            this.setState({ assignees: [...this.assignees, {
                id: item.id, 
                label: item.label,
                isLetterIcon: isTeam,
                iconText: isTeam ? item.label.charAt(0).toUpperCase() : '',
                // Team: blue letter circle; agent: purple mask icon
                iconStyle: isTeam
                    ? 'background-color: var(--brand-blue); color: #fff;'
                    : `-webkit-mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); mask-image: url(${regrelloAssetsUrl}/icons/profile-agent-icon.svg); background-color: white;`
            }] });
        }
        this.showDropdown = false;
    }

    handleDropdownTabClick(event) {
        this.setState({ activeDropdownTab: event.target.dataset.label });
    }
}