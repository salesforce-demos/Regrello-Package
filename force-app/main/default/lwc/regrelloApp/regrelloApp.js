import { LightningElement, api } from 'lwc';

export default class RegrelloApp extends LightningElement {
    screen = 'blueprints'; // 'blueprints' | 'generate-upload' | 'blueprint-detail'
    createBlueprintOpen = false;
    blueprintDetailTitle = '';

    get isBlueprintsScreen() { return this.screen === 'blueprints'; }
    get isGenerateScreen() { return this.screen === 'generate-upload'; }
    get isDetailScreen() { return this.screen === 'blueprint-detail'; }

    handleBlueprintsClick() {
        this.screen = 'blueprints';
        this.createBlueprintOpen = false;
    }

    handleSalesforceClick() {
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
        this.createBlueprintOpen = false;
        this.screen = 'generate-upload';
    }

    handleOpenBlueprintDetail(event) {
        const name = event.detail?.name || 'Supplier Onboarding';
        this.blueprintDetailTitle = name;
        this.screen = 'blueprint-detail';
    }
}