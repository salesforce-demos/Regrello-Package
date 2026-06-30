import { LightningElement } from 'lwc';
import regrelloAssetsUrl from '@salesforce/resourceUrl/regrelloAssets';

export default class RegrelloEmptyState extends LightningElement {
    get emptyStateImgUrl() {
        return `${regrelloAssetsUrl}/images/blueprints-empty-state.png`;
    }

    handleCreateBlueprint() {
        this.dispatchEvent(new CustomEvent('createblueprint'));
    }

    handleInvitePeople() {
        this.dispatchEvent(new CustomEvent('invitepeople'));
    }
}