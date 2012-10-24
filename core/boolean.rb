class Boolean < `Boolean`
  %x{
    Boolean_prototype._isBoolean = true;
  }

  alias singleton_class class

  def to_json
    `(#{self} == true) ? 'true' : 'false'`
  end

  def to_s
    `(#{self} == true) ? 'true' : 'false'`
  end
end