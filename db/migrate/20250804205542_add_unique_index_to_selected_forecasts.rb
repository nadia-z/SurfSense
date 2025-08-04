class AddUniqueIndexToSelectedForecasts < ActiveRecord::Migration[7.1]
  def change
    # First, remove duplicates
    execute <<-SQL
      DELETE FROM selected_forecasts
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM selected_forecasts
        GROUP BY user_id, location_id, time_slot
      );
    SQL

    # Then add unique constraint to prevent future duplicates
    add_index :selected_forecasts, [:user_id, :location_id, :time_slot], unique: true, name: 'unique_forecast_per_user_location_time'
  end
end
