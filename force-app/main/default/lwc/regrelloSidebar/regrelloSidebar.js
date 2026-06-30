import { LightningElement, api } from 'lwc';
import regrelloAssetsUrl from '@salesforce/resourceUrl/regrelloAssets';
import { getSidebarTextConfig } from 'c/regrelloConfigs';

const NAV_COLOR = '#3e7ab5';
const WHITE = '#ffffff';

function iconStyle(file, color, size = 18) {
    const url = `${regrelloAssetsUrl}/icons/${file}`;
    return `background-color:${color};-webkit-mask-image:url(${url});mask-image:url(${url});-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;display:inline-block;width:${size}px;height:${size}px;flex-shrink:0;`;
}

export default class RegrelloSidebar extends LightningElement {
    @api activeItemId = 'blueprints';
    @api configName = 'Dell';

    blueprintsOpen = false;

    get textConfig() {
        return getSidebarTextConfig(this.configName);
    }

    get dellLogoUrl() {
        return `${regrelloAssetsUrl}/images/dell-logo.png`;
    }

    get menuIconStyle() { return iconStyle('menu-icon.svg', NAV_COLOR, 20); }
    get addIconStyle() { return iconStyle('add-icon.svg', WHITE, 18); }
    get searchIconStyle() { return iconStyle('search-icon.svg', NAV_COLOR); }
    get notificationsIconStyle() { return iconStyle('notifications-icon.svg', NAV_COLOR); }
    get homeIconStyle() { return iconStyle('home-icon.svg', NAV_COLOR); }
    get tasksIconStyle() { return iconStyle('tasks-icon.svg', NAV_COLOR); }
    get starredIconStyle() { return iconStyle('starred-icon.svg', NAV_COLOR); }
    get documentsIconStyle() { return iconStyle('documents-icon.svg', NAV_COLOR); }
    get peopleIconStyle() { return iconStyle('people-teams-icon.svg', NAV_COLOR); }
    get blueprintsIconStyle() { return iconStyle('blueprints-icon.svg', NAV_COLOR); }
    get adminIconStyle() { return iconStyle('admin-icon.svg', NAV_COLOR); }
    get chevronStyle() { return iconStyle('carat-right-icon.svg', '#94a3b8', 16); }
    get fieldsIconStyle() { return iconStyle('columns-icon.svg', NAV_COLOR, 16); }
    get tagsIconStyle() { return iconStyle('tag-icon.svg', NAV_COLOR, 16); }

    get blueprintsRowClass() {
        return `nav-item${this.activeItemId === 'blueprints' ? ' nav-item--active' : ''}`;
    }

    get showBlueprintsChildren() {
        return this.blueprintsOpen;
    }

    get shortcutButtonText() {
        return this.textConfig.shortcutButtonText;
    }

    get userName() {
        return this.textConfig.userName;
    }

    get userAvatarText() {
        return this.textConfig.userAvatarText;
    }

    handleBlueprintsClick() {
        // this.blueprintsOpen = true;
        this.dispatchEvent(new CustomEvent('blueprintsclick'));
    }

    handleSalesforceClick() {
        this.dispatchEvent(new CustomEvent('salesforceclick'));
    }
}