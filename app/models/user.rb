class User < ApplicationRecord
  before_validation :strip_db
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  has_many :locations
  has_many :selected_forecasts

  has_one_attached :photo

  private

  def strip_db
    self.first_name = nil if first_name.blank?
    self.last_name  = nil if last_name.blank?
    self.photo = nil if photo.blank?
  end
end
