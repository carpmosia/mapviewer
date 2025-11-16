import Control from "ol/control/Control";
import MapLoader from "./MapLoader";

class MapSelector extends Control {

	maps_pool = [];
	maps_notpool = [];
	selected = {};
	listElement = null;
	selectedLabel = null;
	mapChangeCallback = null;

	static template = (selected) => `
	<div id="map-selector" class="ol-unselectable ol-control">
		<div class="selected-row">
			<p id="map-selector-selected" class="selected-label">${selected.name}</p>
			<button id="map-selector-button" >#</button>
		</div>
		<div id="map-selector-maps" class="hidden">
		</div>
	</div>
	`;
	static pool = ["amber", "bagel", "box", "elkridge", "fland", "marathon", "oasis-2", "saltern-2", "packed", "plasma", "exo", "feint", "centcomm"];

	constructor(opt_options) {
		const options = opt_options || {};
		const element = document.createRange().createContextualFragment(MapSelector.template(options.selected));

		super({
			element: element.getElementById('map-selector'),
			target: options.target
		});

		this.maps_pool = [];
		this.maps_notpool = [];
		this.selected = options.selected;
		this.mapChangeCallback = options.onMapChanged || function(){};

		this.selectedLabel = element.getElementById('map-selector-selected');
		this.listElement = element.getElementById('map-selector-maps');
		element.getElementById('map-selector-button').addEventListener('click', () => this.listElement.classList.toggle('hidden'), false);

		MapSelector.loadMapList().then(list => {
			list.maps.sort();

			this.maps_pool = list.maps.filter((i) => MapSelector.pool.includes(i.id));
			this.maps_notpool = list.maps.filter((i) => !MapSelector.pool.includes(i.id));

			this.updateList();

		});
	}

	handleMapChange(selected) {
		const map = this.getMap();
		MapLoader.loadLayers(map, selected.id).then(() => this.mapChangeCallback(selected, map));

		this.selected = selected;
		this.updateList();
	}

	updateList() {
		this.listElement.innerHTML = '';
		this.selectedLabel.innerHTML = this.selected.name;

		for (const map of this.maps_pool) {
			this.add_button(map);
		}

		const separator = document.createElement('span');
		separator.innerHTML = "Legacy:";
		this.listElement.appendChild(separator);
		
		for (const map of this.maps_notpool) {
			this.add_button(map);
		}
	}

	add_button(map) {
		const mapButton = document.createElement('button');
		mapButton.innerHTML = map.name;

		if (this.selected.id === map.id)
			mapButton.setAttribute("disabled", "")
		else
			mapButton.addEventListener('click', this.handleMapChange.bind(this, map), false);

		this.listElement.appendChild(mapButton);
	}

	static async loadMapList() {
		//'maps/list.json'
		const request = new Request(window.config.mapListUrl);
		const response = await fetch(request);
		if (!response.ok) {
			throw new Error(`Failed to retrieve map list! Status: ${response.status}`);
		}
		return await response.json();
	}

}


export default MapSelector;
