import { LightningElement, api } from 'lwc';
import regrelloAssetsUrl from '@salesforce/resourceUrl/regrelloAssets';
import { getSupplierBlueprintConfig } from 'c/regrelloConfigs';
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
function computeSectionBars(cfg) {
    const result = {};
    let prevSectionStart = 0;
    let prevSectionEnd = 0;

    cfg.BLUEPRINT_SECTION_TITLES.forEach(title => {
        const sectionStart = cfg.SECTION_START_MODE[title] === 'parallel'
            ? prevSectionStart
            : prevSectionEnd;

        const rows = cfg.SECTION_ROWS[title];
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
function buildTimelineItems(cfg) {
    const bars = computeSectionBars(cfg);
    const items = [];

    // Top spacer: aligns the right panel with the first task-row of the first section
    const topSpacer = WORKFLOW_PAD_TOP + INTAKE_H + SECTION_GAP + 6;
    items.push({ type: 'spacer', key: 'spacer-top', heightStyle: `height:${topSpacer}px;` });

    cfg.BLUEPRINT_SECTION_TITLES.forEach((title, sIdx) => {
        const isLast = sIdx === cfg.BLUEPRINT_SECTION_TITLES.length - 1;

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

export default class RegrelloSupplierBlueprint extends LightningElement {
    @api blueprintTitle = '';
    @api configName = 'Dell';

    stageTab = 'Stages';
    rightTab = 'Schedule';

    _syncSetup = false;

    get _cfg() {
        return getSupplierBlueprintConfig(this.configName);
    }

    get editIconStyle() {
        const url = `${regrelloAssetsUrl}/icons/edit-icon.svg`;
        return `background-color:#64748b;-webkit-mask-image:url(${url});mask-image:url(${url});-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;display:inline-block;width:12px;height:12px;flex-shrink:0;`;
    }

    get moreIconStyle() {
        const url = `${regrelloAssetsUrl}/icons/more-icon.svg`;
        return `background-color:#64748b;-webkit-mask-image:url(${url});mask-image:url(${url});-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;display:inline-block;width:16px;height:16px;flex-shrink:0;`;
    }

    get stageTabs() {
        return this._cfg.STAGE_TABS.map(t => ({
            key: t, label: t,
            tabClass: `header-tab${this.stageTab === t ? ' header-tab--active' : ''}`
        }));
    }

    get rightTabs() {
        return this._cfg.RIGHT_TABS.map(t => ({
            key: t, label: t,
            tabClass: `header-tab${this.rightTab === t ? ' header-tab--active' : ''}`
        }));
    }

    get timelineSegments() {
        return this._cfg.BLUEPRINT_SECTION_TITLES.map((_, i) => ({
            key: i,
            segClass: `timeline-seg${i === 0 ? ' timeline-seg--first' : ''}${i === this._cfg.BLUEPRINT_SECTION_TITLES.length - 1 ? ' timeline-seg--last' : ''}`
        }));
    }

    get dayLabels() {
        return this._cfg.DAY_LABELS.map((d, i) => ({
            key: d, label: d,
            cellClass: `day-cell${i > 0 ? ' day-cell--border' : ''}${i % 2 === 0 ? ' day-cell--even' : ' day-cell--odd'}`
        }));
    }

    get workflowSections() {
        return this._cfg.BLUEPRINT_SECTION_TITLES.map((title, i) => ({
            key: title, title,
            visibleRowCount: this._cfg.SECTION_ROWS[title].length,
            headerStartsReady: true,
            isLast: i === this._cfg.BLUEPRINT_SECTION_TITLES.length - 1
        }));
    }

    /** Flat list of spacers + bar rows for the right panel */
    get timelineItems() {
        return buildTimelineItems(this._cfg).map(item => ({
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