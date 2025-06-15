"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  Globe,
  Building,
  Home,
  X,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react"
import { SearchableSelect } from "./searchable-select"
import { ThemeToggle } from "./theme-toggle"
import locationsData from "../data/locations.json"

interface LocationData {
  [country: string]: {
    [state: string]: string[]
  }
}

export default function LocationFilter() {
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [selectedState, setSelectedState] = useState<string>("")
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [copied, setCopied] = useState(false)

  const locations = locationsData as LocationData

  // Load saved filters from localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem("location-filters")
    if (savedFilters) {
      try {
        const { country, state, city } = JSON.parse(savedFilters)
        if (country && locations[country]) {
          setSelectedCountry(country)
          if (state && locations[country][state]) {
            setSelectedState(state)
            if (city && locations[country][state].includes(city)) {
              setSelectedCity(city)
            }
          }
        }
      } catch (error) {
        console.error("Error loading saved filters:", error)
      }
    }
  }, [])

  // Save filters to localStorage whenever they change
  useEffect(() => {
    const filters = {
      country: selectedCountry,
      state: selectedState,
      city: selectedCity,
    }
    localStorage.setItem("location-filters", JSON.stringify(filters))
  }, [selectedCountry, selectedState, selectedCity])

  // Get available countries
  const countries = useMemo(() => {
    return Object.keys(locations).sort()
  }, [locations])

  // Get available states for selected country
  const states = useMemo(() => {
    if (!selectedCountry || !locations[selectedCountry]) return []
    return Object.keys(locations[selectedCountry]).sort()
  }, [selectedCountry, locations])

  // Get available cities for selected state
  const cities = useMemo(() => {
    if (
      !selectedCountry ||
      !selectedState ||
      !locations[selectedCountry]?.[selectedState]
    )
      return []
    return locations[selectedCountry][selectedState].sort()
  }, [selectedCountry, selectedState, locations])

  // Get filtered results
  const filteredResults = useMemo(() => {
    if (!selectedCountry) return locations

    const result: LocationData = {}

    if (selectedState) {
      if (selectedCity) {
        // Show only selected city
        result[selectedCountry] = {
          [selectedState]: [selectedCity],
        }
      } else {
        // Show all cities in selected state
        result[selectedCountry] = {
          [selectedState]: locations[selectedCountry][selectedState],
        }
      }
    } else {
      // Show all states and cities in selected country
      result[selectedCountry] = locations[selectedCountry]
    }

    return result
  }, [selectedCountry, selectedState, selectedCity, locations])

  // Count totals
  const totalCountries = Object.keys(filteredResults).length
  const totalStates = Object.values(filteredResults).reduce(
    (acc, states) => acc + Object.keys(states).length,
    0
  )
  const totalCities = Object.values(filteredResults).reduce(
    (acc, states) =>
      acc +
      Object.values(states).reduce(
        (stateAcc, cities) => stateAcc + cities.length,
        0
      ),
    0
  )

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value)
    setSelectedState("")
    setSelectedCity("")
  }

  const handleStateChange = (value: string) => {
    setSelectedState(value)
    setSelectedCity("")
  }

  const handleCityChange = (value: string) => {
    setSelectedCity(value)
  }

  const clearFilters = () => {
    setSelectedCountry("")
    setSelectedState("")
    setSelectedCity("")
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(filteredResults, null, 2)
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const hasActiveFilters = selectedCountry || selectedState || selectedCity

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-full mx-auto p-6 space-y-6">
        <Card className="border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="h-5 w-5 text-primary" />
                  Smart Location Filters
                </CardTitle>
                <CardDescription className="mt-1">
                  Select one location at each level. Each selection will filter
                  the available options below.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Country Select */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <label className="text-sm font-medium">Country</label>
                  <Badge variant="secondary" className="text-xs">
                    {countries.length} available
                  </Badge>
                </div>
                <SearchableSelect
                  options={countries}
                  value={selectedCountry}
                  onValueChange={handleCountryChange}
                  placeholder="Search countries..."
                  className="h-11"
                />
              </div>

              {/* State Select */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  <label className="text-sm font-medium">State/Province</label>
                  {selectedCountry && (
                    <Badge variant="secondary" className="text-xs">
                      {states.length} available
                    </Badge>
                  )}
                </div>
                <SearchableSelect
                  options={states}
                  value={selectedState}
                  onValueChange={handleStateChange}
                  placeholder="Search states..."
                  disabled={!selectedCountry}
                  className="h-11"
                />
              </div>

              {/* City Select */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" />
                  <label className="text-sm font-medium">City</label>
                  {selectedState && (
                    <Badge variant="secondary" className="text-xs">
                      {cities.length} available
                    </Badge>
                  )}
                </div>
                <SearchableSelect
                  options={cities}
                  value={selectedCity}
                  onValueChange={handleCityChange}
                  placeholder="Search cities..."
                  disabled={!selectedState}
                  className="h-11"
                />
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                <span className="text-sm font-medium text-muted-foreground">
                  Active filters:
                </span>
                {selectedCountry && (
                  <Badge
                    variant="default"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    <Globe className="h-3 w-3" />
                    {selectedCountry}
                    <button
                      onClick={() => handleCountryChange("")}
                      className="ml-1 hover:bg-primary-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedState && (
                  <Badge
                    variant="default"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    <Building className="h-3 w-3" />
                    {selectedState}
                    <button
                      onClick={() => handleStateChange("")}
                      className="ml-1 hover:bg-primary-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedCity && (
                  <Badge
                    variant="default"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    <Home className="h-3 w-3" />
                    {selectedCity}
                    <button
                      onClick={() => handleCityChange("")}
                      className="ml-1 hover:bg-primary-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {totalCountries.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Countries</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Building className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {totalStates.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    States/Provinces
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Home className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {totalCities.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Cities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtered Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>JSON Results</CardTitle>
                <CardDescription>
                  {selectedCountry
                    ? "Live preview of your selected location data"
                    : "Select a country to view the filtered JSON data"}
                </CardDescription>
              </div>
              {selectedCountry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy JSON
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedCountry ? (
              <div className="bg-muted/30 rounded-lg p-4 max-h-96 overflow-auto border">
                <div className="font-mono text-sm leading-relaxed">
                  <span className="text-muted-foreground">{"{"}</span>
                  <div className="ml-4">
                    <div className="flex">
                      <span className="text-blue-600 dark:text-blue-400">
                        "{selectedCountry}"
                      </span>
                      <span className="text-muted-foreground">: {"{"}</span>
                    </div>
                    <div className="ml-4">
                      {selectedState ? (
                        <>
                          <div className="flex">
                            <span className="text-green-600 dark:text-green-400">
                              "{selectedState}"
                            </span>
                            <span className="text-muted-foreground">: [</span>
                          </div>
                          <div className="ml-4">
                            {selectedCity ? (
                              <span className="text-purple-600 dark:text-purple-400">
                                "{selectedCity}"
                              </span>
                            ) : (
                              locations[selectedCountry][selectedState].map(
                                (city, index) => (
                                  <div key={city}>
                                    <span className="text-purple-600 dark:text-purple-400">
                                      "{city}"
                                    </span>
                                    {index <
                                      locations[selectedCountry][selectedState]
                                        .length -
                                        1 && (
                                      <span className="text-muted-foreground">
                                        ,
                                      </span>
                                    )}
                                  </div>
                                )
                              )
                            )}
                          </div>
                          <span className="text-muted-foreground">]</span>
                        </>
                      ) : (
                        Object.entries(locations[selectedCountry]).map(
                          ([state, cities], stateIndex) => (
                            <div key={state}>
                              <div className="flex">
                                <span className="text-green-600 dark:text-green-400">
                                  "{state}"
                                </span>
                                <span className="text-muted-foreground">
                                  : [
                                </span>
                              </div>
                              <div className="ml-4">
                                {cities.map((city, cityIndex) => (
                                  <div key={city}>
                                    <span className="text-purple-600 dark:text-purple-400">
                                      "{city}"
                                    </span>
                                    {cityIndex < cities.length - 1 && (
                                      <span className="text-muted-foreground">
                                        ,
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div className="flex">
                                <span className="text-muted-foreground">]</span>
                                {stateIndex <
                                  Object.keys(locations[selectedCountry])
                                    .length -
                                    1 && (
                                  <span className="text-muted-foreground">
                                    ,
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        )
                      )}
                    </div>
                    <span className="text-muted-foreground">{"}"}</span>
                  </div>
                  <span className="text-muted-foreground">{"}"}</span>
                </div>
              </div>
            ) : (
              <div className="bg-muted/20 rounded-lg p-8 border-2 border-dashed border-muted-foreground/20">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-muted-foreground/10 rounded-lg flex items-center justify-center">
                    <Globe className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-muted-foreground">
                      No Location Selected
                    </h3>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Choose a country from the dropdown above to see the JSON
                      preview
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-md p-3 max-w-xs mx-auto">
                    <code className="text-xs text-muted-foreground font-mono">
                      {'{ "country": { "state": ["city"] } }'}
                    </code>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
