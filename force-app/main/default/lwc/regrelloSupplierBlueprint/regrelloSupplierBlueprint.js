import { LightningElement, api } from 'lwc';
import regrelloAssetsUrl from '@salesforce/resourceUrl/regrelloAssets';

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

// 'parallel' = starts at same time as previous section (conditional branch)
const SECTION_START_MODE = {
    'Document Submission': 'sequential',
    'Document Processing and Verification': 'sequential',
    'Compliance Review': 'sequential',
    'Contract Generation and Approval': 'sequential',
    'Finance Approval': 'sequential',
    'Legal Review': 'sequential',
    'Contract Execution': 'sequential',
    'Onboarding and Provisioning': 'sequential',
    'IT Escalation Review': 'sequential'
};

const STAGE_TABS = ['Stages', 'About', 'Settings'];
const RIGHT_TABS = ['Schedule', 'Data', 'Forms', 'Documents', 'Access'];
// Original labels: DAY 0, DAY 3 … DAY 18 — each cell = 3 days, total = 18 days
const DAY_LABELS = ['DAY 0', 'DAY 3', 'DAY 6', 'DAY 9', 'DAY 12', 'DAY 15', 'DAY 18'];
const TOTAL_DAYS = 18; // full timeline span in days

/** Parse timeToComplete → decimal days */
function parseDays(s) {
    if (!s || s === 'No due date set') return 4 / 24;
    if (/hour/i.test(s)) return (parseFloat(s) || 4) / 24;
    return parseFloat(s) || 4 / 24;
}

/**
 * Compute Gantt bar positions for every task.
 * Returns a map: sectionTitle → [{ key, leftPct, widthPct }, ...]
 */
function computeSectionBars() {
    const result = {};
    let prevSectionStart = 0;
    let prevSectionEnd = 0;

    BLUEPRINT_SECTION_TITLES.forEach(title => {
        const sectionStart = SECTION_START_MODE[title] === 'parallel'
            ? prevSectionStart
            : prevSectionEnd;

        const rows = SECTION_ROWS[title];
        let prevTaskEnd = sectionStart;
        let sectionEnd = sectionStart;

        result[title] = rows.map(row => {
            const dur = parseDays(row.timeToComplete);
            const isSeq = row.startsDetail.toLowerCase().startsWith('after');
            const start = isSeq ? prevTaskEnd : sectionStart;
            const end = start + dur;

            // leftPct and widthPct relative to TOTAL_DAYS
            const leftPct = (start / TOTAL_DAYS) * 100;
            // minimum display: 1.5% so tiny bars (4h in 18-day scale ≈ 0.93%) still show
            const widthPct = Math.max((dur / TOTAL_DAYS) * 100, 1.5);

            prevTaskEnd = end;
            if (end > sectionEnd) sectionEnd = end;

            return {
                key: row.title,
                title: row.title,
                leftPct: leftPct.toFixed(2),
                widthPct: widthPct.toFixed(2)
            };
        });

        prevSectionStart = sectionStart;
        prevSectionEnd = sectionEnd;
    });

    return result;
}

const SECTION_BARS = computeSectionBars();

// ─── Layout constants (px) must match regrelloBlueprintSection CSS ───────────
const WORKFLOW_PAD_TOP = 18;  // .workflow-scroll padding-top
const INTAKE_H = 47;  // intake card: border(2) + padding(24) + text(20) + inner-border(1)
const SECTION_GAP = 16;  // .workflow-inner gap
const SECTION_HEADER_H = 46;  // section-card border-top(1) + section-header(45)
const TASK_ROW_H = 68;  // task-row: border(1) + padding(24) + content(~43)
const ADD_ACTIONS_H = 62;  // .add-actions: padding(42) + button(20)

/**
 * Build a flat list of items for the right timeline panel.
 * Each item is either:
 *   { type:'spacer', key, heightStyle } — an empty div matching a non-bar left-panel element
 *   { type:'bar', key, title, barStyle, heightStyle } — a gantt bar row
 */
function buildTimelineItems() {
    const bars = SECTION_BARS;
    const items = [];

    // Top spacer: aligns the right panel with the first task-row of the first section
    const topSpacer = WORKFLOW_PAD_TOP + INTAKE_H + SECTION_GAP + 6;
    items.push({ type: 'spacer', key: 'spacer-top', heightStyle: `height:${topSpacer}px;` });

    BLUEPRINT_SECTION_TITLES.forEach((title, sIdx) => {
        const isLast = sIdx === BLUEPRINT_SECTION_TITLES.length - 1;

        // Section header spacer
        items.push({
            type: 'spacer',
            key: `spacer-sh-${sIdx}`,
            heightStyle: `height:${SECTION_HEADER_H}px;`
        });

        // One gantt-bar row per task
        bars[title].forEach(bar => {
            items.push({
                type: 'bar',
                key: bar.key,
                title: bar.title,
                heightStyle: `height:${TASK_ROW_H}px;`,
                barStyle: `left:${bar.leftPct}%;width:${bar.widthPct}%;`
            });
        });

        // Add-actions spacer (always present)
        items.push({
            type: 'spacer',
            key: `spacer-aa-${sIdx}`,
            heightStyle: `height:${ADD_ACTIONS_H}px;`
        });

        // Gap between sections (skip after last)
        if (!isLast) {
            items.push({
                type: 'spacer',
                key: `spacer-gap-${sIdx}`,
                heightStyle: `height:${SECTION_GAP}px;`
            });
        }
    });

    return items;
}

const TIMELINE_ITEMS = buildTimelineItems();

export default class RegrelloSupplierBlueprint extends LightningElement {
    @api blueprintTitle = '';

    stageTab = 'Stages';
    rightTab = 'Schedule';

    _syncSetup = false;

    get editIconStyle() {
        const url = `${regrelloAssetsUrl}/icons/edit-icon.svg`;
        return `background-color:#64748b;-webkit-mask-image:url(${url});mask-image:url(${url});-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;display:inline-block;width:12px;height:12px;flex-shrink:0;`;
    }

    get moreIconStyle() {
        const url = `${regrelloAssetsUrl}/icons/more-icon.svg`;
        return `background-color:#64748b;-webkit-mask-image:url(${url});mask-image:url(${url});-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;display:inline-block;width:16px;height:16px;flex-shrink:0;`;
    }

    get stageTabs() {
        return STAGE_TABS.map(t => ({
            key: t, label: t,
            tabClass: `header-tab${this.stageTab === t ? ' header-tab--active' : ''}`
        }));
    }

    get rightTabs() {
        return RIGHT_TABS.map(t => ({
            key: t, label: t,
            tabClass: `header-tab${this.rightTab === t ? ' header-tab--active' : ''}`
        }));
    }

    get timelineSegments() {
        return BLUEPRINT_SECTION_TITLES.map((_, i) => ({
            key: i,
            segClass: `timeline-seg${i === 0 ? ' timeline-seg--first' : ''}${i === BLUEPRINT_SECTION_TITLES.length - 1 ? ' timeline-seg--last' : ''}`
        }));
    }

    get dayLabels() {
        return DAY_LABELS.map((d, i) => ({
            key: d, label: d,
            cellClass: `day-cell${i > 0 ? ' day-cell--border' : ''}${i % 2 === 0 ? ' day-cell--even' : ' day-cell--odd'}`
        }));
    }

    get workflowSections() {
        return BLUEPRINT_SECTION_TITLES.map((title, i) => ({
            key: title, title,
            visibleRowCount: SECTION_ROWS[title].length,
            headerStartsReady: true,
            isLast: i === BLUEPRINT_SECTION_TITLES.length - 1
        }));
    }

    /** Flat list of spacers + bar rows for the right panel */
    get timelineItems() {
        return TIMELINE_ITEMS.map(item => ({
            ...item,
            isBar: item.type === 'bar',
            isSpacer: item.type === 'spacer'
        }));
    }

    handleStageTab(event) { this.stageTab = event.currentTarget.dataset.tab; }
    handleRightTab(event) { this.rightTab = event.currentTarget.dataset.tab; }

    renderedCallback() {
        if (this._syncSetup) return;
        const left = this.template.querySelector('.workflow-scroll');
        const right = this.template.querySelector('.timeline-scroll');
        if (!left || !right) return;
        this._syncSetup = true;
        left.addEventListener('scroll', () => {
            right.scrollTop = left.scrollTop;
        }, { passive: true });
    }
}