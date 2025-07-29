class UsersController < ApplicationController
  def show
    @user = current_user
  end

  def edit
    @user = current_user
  end

  def update
    user = User.find(params[:id])
    user.update(user_params)
    redirect_to user_path(user)
  end

  private

  def user_params
    #TODO find way to encrypt address data
    params.require(:user).permit(:first_name, :last_name, :address)
  end
end
