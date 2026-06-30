import { LightningElement, api, track } from 'lwc';
import regrelloAssetsUrl from '@salesforce/resourceUrl/regrelloAssets';
import { getGenerateBlueprintConfig } from 'c/regrelloConfigs';

export default class RegrelloGenerateBlueprint extends LightningElement {
    @api configName = 'Dell';
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

    get _cfg() {
        return getGenerateBlueprintConfig(this.configName);
    }

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
        return this._cfg.INDUSTRY_OPTIONS.map(opt => ({
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
        return this._cfg.STEPS.map((label, i) => ({
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
            showRightConnector: i < this._cfg.STEPS.length - 1,
            showRightSpacer:    i === this._cfg.STEPS.length - 1,
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
        this.sections = this._cfg.BLUEPRINT_SECTION_TITLES.map(t => ({
            key: t, title: t,
            visibleRowCount: 0,
            headerStartsReady: false,
            label: this._cfg.SECTION_HEADER_STARTS[t].label,
            asLink: this._cfg.SECTION_HEADER_STARTS[t].asLink
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
        this._cfg.BLUEPRINT_SECTION_TITLES.forEach((title, sIdx) => {
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

        this._cfg.BLUEPRINT_SECTION_TITLES.forEach((title, sIdx) => {
            const rows = this._cfg.SECTION_ROWS[title];
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
            if (sIdx < this._cfg.BLUEPRINT_SECTION_TITLES.length - 1) {
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
        if (idx >= this._cfg.FORM_STAGES.length) {
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

        const stage = this._cfg.FORM_STAGES[idx];
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