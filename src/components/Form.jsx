import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"

import styles from "./Form.module.css";
import Button from "./Button";
import BackButton from "./BackButton";
import Message from "./Message";
import Spinner from "./Spinner";

import { useUrlPosition } from "../hooks/useUrlPosition";
import { useCities } from '../contexts/CitiesContext'
import { useNavigate } from "react-router-dom";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function Form() {
  const [lat, lng] = useUrlPosition()

  const [isLoadingGeo, setIsLoadingGeo] = useState(false)
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [emoji, setEmoji] = useState('')
  const [geoError, setGeoError] = useState('')
  const { createCity, isLoading } = useCities()
  const navigate = useNavigate()

  useEffect(() => {

    if (!lat && !lng) return

    async function fetchCityData() {
      try {
        setIsLoadingGeo(true)
        setGeoError('')
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}`)
        const data = await res.json()

        if (!data.countryCode) throw new Error('Select another place')

        setCityName(data.city || data.locality || '')
        setCountry(data.countryName)
        setEmoji(convertToEmoji(data.countryCode))

      } catch (error) {
        setGeoError(error.message)
      } finally {
        setIsLoadingGeo(false)
      }
    }
    fetchCityData()
  }, [lat, lng])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!cityName || !date) return

    const newCity = {
      cityName, country, emoji, date, notes, position: { lat, lng }
    }
    await createCity(newCity)
    navigate('/app/cities')
  }

  if (isLoadingGeo) return <Spinner></Spinner>
  if (geoError) return <Message message={geoError} />
  if (!lat && !lng) return <Message message={'Start by clicking somewhere om the map'} />

  return (
    <form className={`${styles.form} ${isLoading ? styles.loading : ''}`} onSubmit={handleSubmit}>
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
        <DatePicker id="date" selected={date} onChange={(date) => setDate(date)} dateFormat='dd/MM/yyyy' />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type='primary'>Add</Button>
        <BackButton />
      </div>
    </form >
  );
}

export default Form;
