/* eslint-disable react/prop-types */
import styles from './CountryList.module.css'
import Spinner from './Spinner'
import CountryItem from './CountryItem'
import Message from './Message'
import { useCities } from '../contexts/CitiesContext'

function CountryList() {
    const { cities, isLoading } = useCities()
    if (isLoading) return <Spinner />
    if (!cities.length) return <Message message='Add your first city by clicking on a city on the map' />
    const countries = cities.reduce((acc, item) => {
        if (!acc.map(el => el.country).includes(item.country)) acc.push(item)
        return acc
    }, [])
    return (
        <ul className={styles.countryList}>

            {countries.map(country => <CountryItem key={country.id} country={country} />)}
        </ul>
    )
}

export default CountryList
