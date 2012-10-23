require 'opal-script/parser'

module OpalScript
  def self.parse(str, file='(file)')
    Parser.new.parse str, file
  end
end