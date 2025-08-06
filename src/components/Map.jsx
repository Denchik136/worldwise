/* eslint-disable react/prop-types */
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, useMap, Marker, Popup, useMapEvent } from 'react-leaflet'
import styles from './Map.module.css'
import { useState } from 'react'
import { useCities } from '../contexts/CitiesContext'
import { useEffect } from 'react'
import { useGeolocation } from '../hooks/useGeolocation'
import Button from './Button'
import { useUrlPosition } from '../hooks/useUrlPosition'

function Map() {
    const { cities } = useCities()
    const [mapPosition, setMapPosition] = useState([51.505, -0.09])
    const { isLoading: isLoadingPosition, position: geolocationPosition, getPosition } = useGeolocation()

    const [lat, lng] = useUrlPosition()

    useEffect(() => {
        if (lat && lng) setMapPosition([lat, lng])
    }, [lat, lng])

    useEffect(() => {
        if (geolocationPosition) setMapPosition([geolocationPosition.lat, geolocationPosition.lng])
    }, [geolocationPosition])

    return (
        <div className={styles.mapContainer}>
            {!geolocationPosition && (
                <Button type='position' onClick={getPosition} >
                    {isLoadingPosition ? 'Loading...' : 'Use your position'}
                </Button>
            )}
            <MapContainer
                className={styles.map}
                center={mapPosition}
                zoom={6}
                scrollWheelZoom={true}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {cities.map((city) => (
                    <Marker key={city.id} position={[city.position.lat, city.position.lng]}>
                        <Popup>
                            <span>{city.emoji}</span>
                            <span>{city.cityName}</span>
                        </Popup>
                    </Marker >
                ))}
                <ChangeCenter position={mapPosition} />
                <DetectClick />
            </MapContainer>
        </div >
    )
}

function ChangeCenter({ position }) {
    const map = useMap()
    map.setView(position)
    return null
}

function DetectClick() {
    const navigate = useNavigate()

    useMapEvent({
        click: e => {
            navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`)
        }
    });

    return null;
}
export default Map
