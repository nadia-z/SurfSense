class PagesController < ApplicationController
  def home
    if params[:query].present?
      @locations = Location.search_location(params[:query])
    else
      @locations = Location.where(suggested: true)
    end
  end
end
