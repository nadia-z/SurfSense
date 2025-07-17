class DeleteAddressFromLocations < ActiveRecord::Migration[7.1]
  def change
    remove_column :locations, :address
  end
end
