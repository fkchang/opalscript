require 'bundler/setup'

desc "Rebuild grammar.rb for opal parser"
task :racc do
  %x(racc -l lib/opal-script/grammar.y -o lib/opal-script/grammar.rb)
end