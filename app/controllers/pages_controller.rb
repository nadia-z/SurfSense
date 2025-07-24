require 'json'

class PagesController < ApplicationController
  def home
    file = File.read('app/javascript/data/surf_spots.json')
    locations_data = JSON.parse(file)

    # Create nested structure: countries -> regions -> breaks
    @locations_structure = build_locations_structure(locations_data)

    # Extract lists for dropdowns
    @countries = @locations_structure["countries"].keys.sort
    @regions = extract_all_regions(@locations_structure).sort
    @breaks = extract_all_breaks(@locations_structure).sort

    if params[:query].present?
      @locations = Location.search_location(params[:query])
    else
      @locations = Location.where(suggested: true)
    end
  end

  private  def build_locations_structure(locations_data)
    structure = { "countries" => {} }

    locations_data.each do |spot|
      # Parse country (first value before comma)
      country_parts = spot['country'].split(', ')
      country = country_parts[0]

      # Parse region (second and third values after country)
      region = country_parts[1..2].compact.join(', ')

      # Get break data
      break_name = spot['name'].capitalize
      latitude = spot['lat']
      longitude = spot['lng']

      # Initialize nested structure
      structure["countries"][country] ||= {}
      structure["countries"][country][region] ||= {}

      # Add coordinates as hash with explicit keys
      structure["countries"][country][region][break_name] = {
        latitude: latitude,
        longitude: longitude
      }
    end

    structure
  end

  def extract_all_regions(structure)
    regions = []
    structure["countries"].each_value do |country_data|
      regions.concat(country_data.keys)
    end
    regions.uniq
  end

  def extract_all_breaks(structure)
    breaks = []
    structure["countries"].each_value do |country_data|
      country_data.each_value do |region_data|
        breaks.concat(region_data.keys)
      end
    end
    breaks.uniq
  end
end
