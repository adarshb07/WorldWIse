import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./Map.module.css";
import {
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	useMap,
	useMapEvents,
} from "react-leaflet";
import { useCities } from "../contexts/CitiesContext";
import { useGeolocation } from "../hooks/useGeoLocation";
import { useUrlPosition } from "../hooks/useUrlPosition";
import Button from "./Button";

function Map() {
	const [mapLat, mapLng] = useUrlPosition();
	const { cities } = useCities();
	const [mapPosition, setMapPosition] = useState([40, 0]);
	const {
		isLoading: isLoadingPostion,
		position: geoLocationPostion,
		getPosition,
	} = useGeolocation();

	useEffect(
		function () {
			if (mapLat && mapLng) setMapPosition([mapLat, mapLng]);
		},
		[mapLat, mapLng]
	);

	useEffect(
		function () {
			if (geoLocationPostion) setMapPosition(geoLocationPostion);
		},
		[geoLocationPostion]
	);

	return (
		<div className={styles.mapContainer}>
			{!geoLocationPostion && (
				<Button type="position" onClick={getPosition}>
					{isLoadingPostion ? "Loading..." : "Use Your location"}
				</Button>
			)}
			<MapContainer
				center={mapPosition}
				zoom={12}
				scrollWheelZoom={true}
				className={styles.map}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
				/>

				{cities.map((city) => (
					<Marker position={city.position} key={city.id}>
						<Popup>
							<span>{city.emoji}</span>
							<span>{city.cityName}</span>
						</Popup>
					</Marker>
				))}
				<ChangeCenter postion={mapPosition} />
				<DetectClick />
			</MapContainer>
		</div>
	);
}

function ChangeCenter({ postion }) {
	const map = useMap();

	map.setView(postion);

	return null;
}

function DetectClick() {
	const navigate = useNavigate();

	useMapEvents({
		click: (e) => {
			navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
		},
	});
}

export default Map;
