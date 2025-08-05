class SelectedForecast < ApplicationRecord
  belongs_to :user

  # Validations for the new location fields
  validates :region, presence: true
  validates :country, presence: true
  validates :break, presence: true
  validates :time_slot, presence: true

  # Ensure uniqueness per user and location combination
  validates :time_slot, uniqueness: {
    scope: [:user_id, :region, :country, :break],
    message: "has already been saved for this location"
  }
end
