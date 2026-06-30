import { LightningElement } from 'lwc';
import regrelloAssetsUrl from '@salesforce/resourceUrl/regrelloAssets';

function iconStyle(file, color, size = 16) {
    const url = `${regrelloAssetsUrl}/icons/${file}`;
    return `background-color:${color};-webkit-mask-image:url(${url});mask-image:url(${url});-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;display:inline-block;width:${size}px;height:${size}px;flex-shrink:0;`;
}

export default class RegrelloBlueprintsHeader extends LightningElement {
    activeTab = 'published';
    showVariants = false;
    viewMode = 'grid';

    get blueprintsIconStyle() {
        return iconStyle('blueprints-icon.svg', '#0f172a', 22);
    }

    get searchIconInlineStyle() {
        return iconStyle('search-icon.svg', '#94a3b8');
    }

    get sortIconStyle() {
        return iconStyle('decending-icon.svg', '#64748b');
    }

    get prevIconStyle() {
        return iconStyle('carat-left-icon.svg', '#94a3b8');
    }

    get nextIconStyle() {
        return iconStyle('carat-right-icon.svg', '#94a3b8');
    }

    get gridIconStyle() {
        const color = this.viewMode === 'grid' ? '#4070d0' : '#5f656c';
        return iconStyle('grid-view-icon.svg', color);
    }

    get listIconStyle() {
        const color = this.viewMode === 'list' ? '#4070d0' : '#5f656c';
        return iconStyle('list-view-icon.svg', color);
    }

    get publishedTabClass() {
        return `tab-btn${this.activeTab === 'published' ? ' tab-btn--active' : ''}`;
    }

    get draftTabClass() {
        return `tab-btn${this.activeTab === 'draft' ? ' tab-btn--active' : ''}`;
    }

    get gridBtnClass() {
        return `view-btn${this.viewMode === 'grid' ? ' view-btn--active' : ''}`;
    }

    get listBtnClass() {
        return `view-btn${this.viewMode === 'list' ? ' view-btn--active' : ''}`;
    }

    get toggleClass() {
        return `toggle-track${this.showVariants ? ' toggle-track--on' : ''}`;
    }

    get toggleThumbClass() {
        return `toggle-thumb${this.showVariants ? ' toggle-thumb--on' : ''}`;
    }

    handlePublishedTab() {
        this.activeTab = 'published';
    }

    handleDraftTab() {
        this.activeTab = 'draft';
    }

    handleToggleVariants() {
        this.showVariants = !this.showVariants;
    }

    handleGridView() {
        this.viewMode = 'grid';
    }

    handleListView() {
        this.viewMode = 'list';
    }

    handleCreateBlueprint() {
        this.dispatchEvent(new CustomEvent('createblueprint'));
    }
}