#!perl.exe

# my $swear = pop(@ARGV);

my $task = join(" ", @ARGV);

print STDOUT "Which ";
system (qw{node yafi.js});
print STDOUT " decided I was going to have to $task?\n";
exit;