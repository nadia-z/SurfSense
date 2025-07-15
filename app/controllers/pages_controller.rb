class PagesController < ApplicationController
  def home
    if params[:query].present?
      @location = Location.search_spot(params[:query])
    else
      @locations = Movie.where(suggested: true)
  end
end
