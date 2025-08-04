Rails.application.routes.draw do
  get 'selected_forecasts/create'
  get 'selected_forecasts/index'
  get 'selected_forecasts/show'
  get 'selected_forecasts/destroy'
  devise_for :users
  resources :users, only: [:show, :edit, :update]
  post "users/:id", to: "users#delete_photo"
  root to: "pages#home"

  get "root" => "locations#new"
  post "locations" => "locations#create"
  delete "locations/:id" => "locations#destroy"

  get "forecasts" => "locations#forecast_slots", as: :forecast

  # Add selected_forecasts routes
  resources :selected_forecasts, only: [:create, :index, :show, :destroy]

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
