import { LightningElement } from 'lwc';
import regrelloAssetsUrl from '@salesforce/resourceUrl/regrelloAssets';

const BRAND = '#0176d3';

function iconStyle(file, size = 18) {
    const url = `${regrelloAssetsUrl}/icons/${file}`;
    return `background-color:${BRAND};-webkit-mask-image:url(${url});mask-image:url(${url});-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;display:inline-block;width:${size}px;height:${size}px;flex-shrink:0;`;
}

export default class RegrelloCreateModal extends LightningElement {
    selected = null;

    get options() {
        return [
            {
                id: 'scratch',
                title: 'From scratch',
                description: 'Start with an empty blueprint.',
                iconStyle: iconStyle('edit-icon.svg', 18),
                key: 'scratch',
                rowClass: `option-btn${this.selected === 'scratch' ? ' option-btn--selected' : ''}`
            },
            {
                id: 'ai',
                title: 'Generate with AI',
                description: 'Auto-generate a blueprint based on a process name and documentation.',
                iconStyle: iconStyle('generate-icon.svg', 24),
                key: 'ai',
                rowClass: `option-btn${this.selected === 'ai' ? ' option-btn--selected' : ''}`
            },
            {
                id: 'import',
                title: 'Import from another workspace',
                description: 'Import a blueprint file exported from another workspace.',
                iconStyle: iconStyle('import-icon.svg', 18),
                key: 'import',
                rowClass: `option-btn${this.selected === 'import' ? ' option-btn--selected' : ''}`
            }
        ];
    }

    get closeIconStyle() {
        return `color:#64748b;font-size:20px;`;
    }

    handleOptionClick(event) {
        const id = event.currentTarget.dataset.id;
        this.selected = id;
        if (id === 'ai') {
            setTimeout(() => {
                this.dispatchEvent(new CustomEvent('chooseai'));
            }, 140);
        }
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleBackdropClick() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}