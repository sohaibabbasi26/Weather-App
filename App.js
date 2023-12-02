import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, SafeAreaView, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import theme from './theme/index';
import { CalendarDaysIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { MapPinIcon } from 'react-native-heroicons/solid'
import { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash'
import { fetchLocations, fetchWeatherForecast } from './api/weather';
import { weatherImages } from './constants';
import * as Progress from 'react-native-progress';

export default function App() {

  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  const handleLocation = (loc) => {

    console.log('locations:', loc);
    setLocations([]);
    toggleSearch(false);

    setLoading(true)
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7'
    }).then((data) => {
      setWeather(data);
      setLoading(false)
      console.log('got data :', data);
    })
  }

  const handleSearch = (value) => {
    try {
      if (value.length > 2) {
        fetchLocations({ cityName: value }).then((data) => {
          setLocations(data);
        })
      }
    }
    catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchMyWeatherData()
  }, [])

  const fetchMyWeatherData = async () => {
    fetchWeatherForecast({
      cityName: 'Karachi',
      days: '7'
    }).then((data) => {
      setWeather(data);
      setLoading(false)
    })
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);
  const { current, location } = weather;

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <StatusBar style='light' />
      <Image
        source={require('./assets/bg-1.jpg')}
        style={{ position: 'absolute', height: '100%', width: '100%' }}
        blurRadius={70}
      />
      {
        loading ? (
          <View className='flex-1 flex-row justify-center items-center'>
            <Progress.CircleSnail thickness={10} size={140} color={'#fff'} />
          </View>
        ): (
            <SafeAreaView style = {{ flex: 1 }}>
      {/* Search Section */}
      <View style={{ height: 50, marginHorizontal: 16, position: 'relative', zIndex: 50 }}>
        <View
          style={
            {
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              borderRadius: 25,
              backgroundColor: showSearch ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
            }
          }
          className='mt-1'
        >
          {
            showSearch ? (
              <TextInput
                onChangeText={handleTextDebounce}
                style={{ flex: 1, paddingHorizontal: 10, color: 'white' }} // Added styles
                placeholder='Search City'
                placeholderTextColor='lightgray'
              />
            ) : null
          }


          <TouchableOpacity
            onPress={() => toggleSearch(!showSearch)}
            style={
              {
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            }
            className='rounded-full p-3  m-1'
          >
            <MagnifyingGlassIcon size={15} color="white" />
          </TouchableOpacity>
        </View>
        {
          locations.length > 0 && showSearch ? (
            <View style={{ position: 'absolute', top: 50, width: '100%' }}>
              <View className=' w-full bg-gray-300 rounded-3xl mt-2' >
                {
                  locations?.map((loc, index) => {
                    let showBorder = index + 1 != locations.length;
                    let borderClass = showBorder ? 'border-b-2 border-b-gray-400 ' : ''
                    return (
                      <TouchableOpacity
                        onPress={() => handleLocation(loc)}
                        key={index}
                        className={'flex-row items-center border-0 p-4 px-4 ' + borderClass}
                      >
                        <MapPinIcon size={25} color={'gray'} />
                        <Text className='text-black text-lg ml-2'>{loc?.name}, {loc?.country}</Text>
                      </TouchableOpacity>
                    )
                  })
                }
              </View>
            </View>
          ) : null
        }
      </View>


      {/* forecast section */}

      <View className="mx-4 flex justify-around flex-1 mb-2" >
        {/* location */}
        <Text className="text-white text-center text-2xl font-bold" >
          {location?.name}
          <Text
            className="text-lg font-semibold text-gray-300"
          >
            ,{" " + location?.country}
          </Text>
        </Text>
        {/*weather image */}

        <View className='flex-row justify-center' >
          <Image
            // source={require('./assets/images/partlycloudy.png')}
            source={weatherImages[current?.condition?.text]}
            className='h-52 w-52'
          />
        </View>

        {/* degree celcius */}
        <View className='space-y-2'>
          <Text className='text-center font-bold text-white text-6xl ml-5'>
            {current?.temp_c}°
          </Text>

          <Text className='text-center text-white text-xl tracking-widest '>
            {current?.condition?.text}
          </Text>
        </View>

        {/* other stats */}
        <View className='flex-row justify-between mx-4' >
          <View className='flex-row space-x-2 items-center'>
            <Image
              source={require('./assets/images/wind.png')}
              className='h-6 w-6 '
              style={{ color: 'white' }}
            />
            <Text className='text-white font-semibold text-base' >{current?.wind_kph}km</Text>
          </View>

          <View className='flex-row space-x-2 items-center'>
            <Image
              source={require('./assets/images/drop.png')}
              className='h-6 w-6 '
              style={{ color: 'white' }}
            />
            <Text className='text-white font-semibold text-base' >{current?.humidity}%</Text>
          </View>

          <View className='flex-row space-x-2 items-center'>
            <Image
              source={require('./assets/images/sun.png')}
              className='h-6 w-6 '
              style={{ color: 'white' }}
            />
            <Text className='text-white font-semibold text-base' >6:05 AM</Text>
          </View>
        </View>


        {/* forecast for other days */}

        <View className='mb-2 space-y-3' >
          <View className='flex-row items-center mx-5 space-x-2'>
            <CalendarDaysIcon size={25} color={'white'} />
            <Text className='text-white text-base' >Daily Forecast</Text>
          </View>

          <ScrollView
            horizontal
            contentContainerStyle={{ paddingHorizontal: 15 }}
            showsHorizontalScrollIndicator={false}
          >
            {
              weather?.forecast?.forecastday?.map((item, index) => {

                let date = new Date(item?.date);
                let options = { weekday: 'long' };
                let dayName = date.toLocaleDateString('en-US', options);
                dayName = dayName.split(',')[0];
                return (
                  <View
                    key={index}
                    className='flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4'
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                  >
                    <Image
                      // source={require('./assets/images/heavyrain.png')}
                      source={weatherImages[item?.day?.condition?.text]}

                      className='h-11 w-11'
                    />
                    <Text className='text-white'>{dayName}</Text>
                    <Text className='text-white font-semibold text-xl'>{item?.day?.avgtemp_c}°</Text>
                  </View>
                )
              })
            }

          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  )
}
      
    </View >
  );
}