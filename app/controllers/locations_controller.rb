require 'json'

class LocationsController < ApplicationController

  def new
    @location = Location.new()
    # this code below allows us access to the location index while using the same
    # GET request from the new method
    @locations = current_user.locations.all
  end

  def create
    @location = current_user.locations.build(location_params)

    respond_to do |format|
      if @location.save
        format.html { redirect_to root_path, notice: 'Location saved successfully!' }
        format.json { render json: { status: 'success', message: 'Location saved successfully!', location_id: @location.id } }
      elsif current_user.nil?
        format.html { redirect_to root_path, alert: 'Log-in to save locations' }
        format.json { render json: { status: 'error', message: 'Log-in to save locations', errors: @location.errors } }

      else
        format.html { redirect_to root_path, alert: 'Failed to save location.' }
        format.json { render json: { status: 'error', message: 'Failed to save location.', errors: @location.errors } }
      end
    end
  end

  def destroy
    @location = current_user.locations.find(params[:id])

    respond_to do |format|
      begin
        # First delete any associated selected_forecasts by matching location data
        # Since we removed location_id, we need to find forecasts by region/country/break
        selected_forecasts = current_user.selected_forecasts.where(
          region: @location.region,
          country: @location.country,
          break: @location.break
        )

        if selected_forecasts.any?
          selected_forecasts.destroy_all
          Rails.logger.info "Deleted #{selected_forecasts.count} associated selected forecasts for location #{@location.id}"
        end

        # Then delete the location
        if @location.destroy
          format.html { redirect_to root_path, notice: 'Location removed successfully!' }
          format.json { render json: { status: 'success', message: 'Location removed successfully!' } }
        else
          format.html { redirect_to root_path, alert: 'Failed to remove location.' }
          format.json { render json: { status: 'error', message: 'Failed to remove location.', errors: @location.errors } }
        end
      rescue ActiveRecord::InvalidForeignKey => e
        format.html { redirect_to root_path, alert: 'Cannot delete location: it has associated data.' }
        format.json { render json: { status: 'error', message: 'Cannot delete location: it has associated data.' } }
      end
    end
  rescue ActiveRecord::RecordNotFound
    respond_to do |format|
      format.html { redirect_to root_path, alert: 'Location not found.' }
      format.json { render json: { status: 'error', message: 'Location not found.' } }
    end
  end

  def forecast_slots
    # this logic will have to be replaced by code to request selected forecast for a given location and date from an API
    file = File.read("lib/assets/time_slots.json")
    @forecasts = JSON.parse(file)
  end

  private

  def location_params
    params.require(:location).permit(:latitude, :longitude, :region, :country, :break)
  end

end
