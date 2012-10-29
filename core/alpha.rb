# regexp matches
$~ = nil

$/ = "\n"

RUBY_ENGINE   = 'opal'
RUBY_PLATFORM = 'opal'
OPAL_VERSION  = `_opal.version`

def to_s
  'main'
end

def include(mod)
  Object.include mod
end