trips <- read.csv(file="2014-pr3-hhsurvey-trips.csv", stringsAsFactors=F)
trips <- trips[,c("recordID","o_tract","d_tract","time_start_hhmm","mode","d_purpose")]
#for (i in 1:nrow(trips)) {trips$time_start_hhmm[i] <- strsplit(trips$time_start_hhmm[i],":")[[1]][1]}
trips$time_start_hhmm <- as.integer(unlist(lapply(trips$time_start_hhmm,function(x) strsplit(x,":")[[1]][1])))

library(dplyr)
trips_agg_mode <- trips %>% group_by(o_tract,d_tract,time_start_hhmm,mode) %>% summarise(count = n())
trips_agg_purpose <- trips %>% group_by(o_tract,d_tract,time_start_hhmm,d_purpose) %>% summarise(count = n())

#trips_agg <- trips %>% group_by(o_tract,d_tract,time_start_hhmm) %>% summarise(count = n())
#max(trips_agg_mode$count)
#max(trips_agg$count)

write.csv(trips_agg_mode, file="trips_per_mode.csv")

#930 null trips
nrow(trips[is.na(trips$o_tract) | is.na(trips$d_tract),])
