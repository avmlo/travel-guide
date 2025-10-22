import { Router } from "express";
import axios from "axios";
import { API_TIMEOUTS } from "@shared/const";

const router = Router();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

// Create axios instance with timeout
const placesAxios = axios.create({
  timeout: API_TIMEOUTS.GOOGLE_PLACES,
  headers: { 'Accept': 'application/json' }
});

interface PlaceDetails {
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  url?: string;
}

// Search for a place by name and city
router.get("/api/places/search", async (req, res) => {
  try {
    const { name, city } = req.query;
    
    if (!name || !city) {
      return res.status(400).json({ error: "Name and city are required" });
    }

    if (!GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({ error: "Google Places API key not configured" });
    }

    const query = `${name}, ${city}`;
    
    // Find Place from Text
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
    const searchParams = {
      input: query,
      inputtype: 'textquery',
      fields: 'place_id,name,formatted_address',
      key: GOOGLE_PLACES_API_KEY,
    };

    const searchResponse = await placesAxios.get(searchUrl, { params: searchParams });
    
    if (!searchResponse.data.candidates || searchResponse.data.candidates.length === 0) {
      return res.status(404).json({ error: "Place not found" });
    }

    const placeId = searchResponse.data.candidates[0].place_id;

    // Get Place Details
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json`;
    const detailsParams = {
      place_id: placeId,
      fields: 'name,formatted_address,formatted_phone_number,international_phone_number,website,opening_hours,rating,user_ratings_total,price_level,geometry,url',
      key: GOOGLE_PLACES_API_KEY,
    };

    const detailsResponse = await placesAxios.get(detailsUrl, { params: detailsParams });
    
    if (detailsResponse.data.status !== 'OK') {
      return res.status(500).json({ error: "Failed to fetch place details" });
    }

    const placeDetails: PlaceDetails = detailsResponse.data.result;

    res.json({
      name: placeDetails.name,
      address: placeDetails.formatted_address,
      phone: placeDetails.formatted_phone_number || placeDetails.international_phone_number,
      website: placeDetails.website,
      opening_hours: placeDetails.opening_hours,
      rating: placeDetails.rating,
      user_ratings_total: placeDetails.user_ratings_total,
      price_level: placeDetails.price_level,
      location: placeDetails.geometry?.location,
      google_maps_url: placeDetails.url,
      place_id: placeId,
    });

  } catch (error: any) {
    console.error('Error fetching place details:', error.message);
    res.status(500).json({ error: "Failed to fetch place information" });
  }
});



export default router;

