// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";

import styles from "./Form.module.css";
import Button from "./Button";
import ButtonBack from "./ButtonBack";

import { useUrlPosition } from "../hooks/useUrlPosition";
import Spinner from "./Spinner";
import Message from "./Message";

export function convertToEmoji(countryCode) {
	const codePoints = countryCode
		.toUpperCase()
		.split("")
		.map((char) => 127397 + char.charCodeAt());
	return String.fromCodePoint(...codePoints);
}

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

function Form() {
	const [lat, lng] = useUrlPosition();
	const [cityName, setCityName] = useState("");
	const [emoji, setEmoji] = useState("");
	const [country, setCountry] = useState("");
	const [date, setDate] = useState(new Date());
	const [notes, setNotes] = useState("");

	const [isLoadingGeoLocation, setIsLoadingGeoLocation] = useState(false);
	const [geoLocationError, setGeoLocationError] = useState("");

	useEffect(
		function () {
			async function fetchCitiesData() {
				try {
					setIsLoadingGeoLocation(true);
					setGeoLocationError("");
					const res = await fetch(
						`${BASE_URL}?latitude=${lat}&longitude=${lng}`
					);
					const data = await res.json();
					if (!data.countryCode)
						throw new Error(
							"That doesn't seem to be a city. Click some where else "
						);
					setCityName(data.city || data.locality || "");
					setCountry(data.countryName);
					setEmoji(() => convertToEmoji(data.countryCode));
				} catch (err) {
					console.error(err.message);
					setGeoLocationError(err.message);
				} finally {
					setIsLoadingGeoLocation(false);
				}
			}

			fetchCitiesData();
		},
		[lat, lng]
	);

	if (isLoadingGeoLocation) return <Spinner />;
	if (geoLocationError) return <Message message={geoLocationError} />;

	return (
		<form className={styles.form}>
			<div className={styles.row}>
				<label htmlFor="cityName">City name</label>
				<input
					id="cityName"
					onChange={(e) => setCityName(e.target.value)}
					value={cityName}
				/>
				<span className={styles.flag}>{emoji}</span>
			</div>

			<div className={styles.row}>
				<label htmlFor="date">When did you go to {cityName}?</label>
				<input
					id="date"
					onChange={(e) => setDate(e.target.value)}
					value={date}
				/>
			</div>

			<div className={styles.row}>
				<label htmlFor="notes">
					Notes about your trip to {cityName}
				</label>
				<textarea
					id="notes"
					onChange={(e) => setNotes(e.target.value)}
					value={notes}
				/>
			</div>

			<div className={styles.buttons}>
				<Button type="primary">Add</Button>
				<ButtonBack />
			</div>
		</form>
	);
}

export default Form;
