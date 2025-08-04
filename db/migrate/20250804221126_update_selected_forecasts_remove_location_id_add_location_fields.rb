class UpdateSelectedForecastsRemoveLocationIdAddLocationFields < ActiveRecord::Migration[7.1]
  def change
    # Add location fields to selected_forecasts
    add_column :selected_forecasts, :region, :string
    add_column :selected_forecasts, :country, :string
    add_column :selected_forecasts, :break, :string

    # Remove the foreign key constraint first
    remove_foreign_key :selected_forecasts, :locations

    # Remove the existing unique index that includes location_id
    remove_index :selected_forecasts, name: "unique_forecast_per_user_location_time"

    # Remove the location_id index
    remove_index :selected_forecasts, :location_id

    # Remove the location_id column
    remove_column :selected_forecasts, :location_id, :bigint

    # Add new unique index using the location fields instead of location_id
    add_index :selected_forecasts, [:user_id, :region, :country, :break, :time_slot],
              unique: true,
              name: "unique_forecast_per_user_location_time_new"
  end
end
