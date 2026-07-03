import { LightningElement } from 'lwc';
import regrelloAssetsUrl from '@salesforce/resourceUrl/regrelloAssets';

const PRELOAD_IMAGE_PATHS = [
    'images/blueprints-empty-state.png',
    'images/dell-logo.png'
];

export default class RegrelloApp extends LightningElement {
    configName = 'Dell';
    screen = 'blueprints'; // 'blueprints' | 'generate-upload' | 'blueprint-detail'
    createBlueprintOpen = false;
    blueprintDetailTitle = '';
    shouldRenderGenerateScreen = false;
    shouldRenderDetailScreen = false;
    _preloadedImages = [];

    get isBlueprintsScreen() { return this.screen === 'blueprints'; }
    get isGenerateScreen() { return this.screen === 'generate-upload'; }
    get isDetailScreen() { return this.screen === 'blueprint-detail'; }
    get blueprintsPanelClass() { return this.isBlueprintsScreen ? 'screen-panel' : 'screen-panel screen-panel--hidden'; }
    get generatePanelClass() { return this.isGenerateScreen ? 'screen-panel' : 'screen-panel screen-panel--hidden'; }
    get detailPanelClass() { return this.isDetailScreen ? 'screen-panel' : 'screen-panel screen-panel--hidden'; }

    connectedCallback() {
        const params = new URLSearchParams(window.location.search);
        const fromUrl = params.get('configname');
        this.configName = fromUrl || 'Dell';
        this.preloadAppImages();
        this.scheduleScreenPreload();

        const styles = `
            .cCenterPanel {
                padding: 0 !important;
                margin: 0 !important;
                max-width: none !important;
            }
            .contentRegion {
                padding: 0 !important;
                margin: 0 !important;
            }
            .slds-template_default {
                padding: 0!important;
            }
            .siteforceContentArea {
                padding: 0!important;
            }
            .siteforceContentArea .comm-layout-column:not(:empty) {
                padding: 0!important;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }

    preloadAppImages() {
        this._preloadedImages = PRELOAD_IMAGE_PATHS.map(path => {
            const img = new Image();
            img.src = `${regrelloAssetsUrl}/${path}`;
            return img;
        });
    }

    scheduleScreenPreload() {
        window.setTimeout(() => {
            this.shouldRenderGenerateScreen = true;
            this.shouldRenderDetailScreen = true;
        }, 0);
    }

    handleBlueprintsClick() {
        this.screen = 'blueprints';
        this.createBlueprintOpen = false;
    }

    handleSalesforceClick() {
        this.shouldRenderDetailScreen = true;
        this.createBlueprintOpen = false;
        this.blueprintDetailTitle = 'Supplier Onboarding';
        this.screen = 'blueprint-detail';
    }

    handleOpenModal() {
        this.createBlueprintOpen = true;
    }

    handleCloseModal() {
        this.createBlueprintOpen = false;
    }

    handleChooseAi() {
        this.shouldRenderGenerateScreen = true;
        this.createBlueprintOpen = false;
        this.screen = 'generate-upload';
    }

    handleOpenBlueprintDetail(event) {
        this.shouldRenderDetailScreen = true;
        const name = event.detail?.name || 'Supplier Onboarding';
        this.blueprintDetailTitle = name;
        this.screen = 'blueprint-detail';
    }
}