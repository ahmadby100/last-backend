~~- Top 5/10 from year/month/week~~
  - [x] Artist 
  - [x] Album
  - [x] Track
  - [x] Time Played
~~- Total Plays (Scrobbles) ~~
  - [x] Monthly Scrobbles
  - [x] Weekly Scrobbles
  - [x] Daily Scrobbles (Monthly)                         
~~- [x] Average {Daily,Weekly,Monthly} Scrobbles~~
~~- Listening Time (format: [weeks, days, hours, minutes, seconds]) ~~
  - [x] Monthly          
  - [x] Weekly           
  - [x] Daily  
  

- Artist
    ~~- [x] Number of Artists Listened To         ~~
    ~~- [x] Top (5/10) Artist             ~~
    - [ ] On Repeat*            
    - [ ] New Artists This [year, month, week]
- Album
    ~~- [x] Number of Albums Listened To      ~~
    ~~- [x] Top (5/10) Albums         ~~
    - [ ] On Repeat*            
    - [ ] New Albums This [year, month, week]                   
- Tracks
~~    - [x] Number of Tracks Listened To          ~~
  ~~  - [x] Top (5/10) Tracks             ~~
    - [ ] On Repeat*            
    - [ ] New Tracks This [year, month, week]
- Top Genre [year, month, week] 

- Listening Time 
    - [ ] Most Active Hour              (WHERE HOUR(FROM_UNIXTIME(date)) = ${hour})
    - [ ] Average Scrobbles each Hour   (SELECT COUNT(track) FROM last WHERE HOUR(FROM_UNIXTIME(date)) = ${hour})           
    - [ ] Most Active Day of the Week   (SELECT COUNT(track) FROM last WHERE HOUR(FROM_UNIXTIME(date)) = ${hour} ORDER BY )

- Most Active Day
   - [ ] Rank Most Active Days             
Table Format
```sql
CREATE TABLE last (
    track varchar(250),
    track_mbid varchar(250),
    artist varchar(250),
    artist_mbid varchar(250),
    album varchar(250),
    album_mbid varchar(250),
    date TIMESTAMP,
    day varchar(250),
    duration int,
    tags varchar(250)
);
```


### Time Periods: 
- 1 Week  = 604800
- 1 Month = 2628000
- 1 Year  = 31540000

|Time Period    |           Start                      |          End                       |
|---------------|--------------------------------------|------------------------------------|
|N Week(s) Ago  | UNIX_TIMESTAMP() - (@n)*(604800)    | UNIX_TIMESTAMP() - (@n-1)*(604800)    |
|N Month(s) Ago | UNIX_TIMESTAMP() - (@n)*(2628000)   | UNIX_TIMESTAMP() - (@n-1)*(2628000)   |
|N Year(s) Ago  | UNIX_TIMESTAMP() - (@n)*(31540000)  | UNIX_TIMESTAMP() - (@n-1)*(31540000)|

<hr>

## **Expression for finding songs listened to *n* week(s) ago**

```sql 
SELECT last.*, FROM_UNIXTIME(date) AS date FROM last
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time);

where
     @time is the time period (week, month, year)
     @n is the number of time periods
```
- This returns the tracks that were listened to the past n week
  - <span name="#total_plays"> The number of tracks listened in the time period is the number of rows</span>
## **To find the unique number of tracks listened** 
```sql
SELECT track FROM last
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time)
GROUP BY track;
```
## **To find the unique number of artists listened**
```sql
SELECT artist FROM last
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time)
GROUP BY artist;
```
## **To find the unique number of albums listened**
```sql
SELECT album FROM last
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time)
GROUP BY album;
```


## **Expression for finding the top listened albums:**
```sql
SELECT COUNT(track) AS plays,album FROM last
GROUP BY album 
ORDER BY plays DESC
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time);
```
## **Expression for finding the top listened artists:**
```sql
SELECT COUNT(track) AS plays,artist FROM last
GROUP BY artist 
ORDER BY plays DESC
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time);
```
## **Expression for finding the top listened tracks:**
```sql
SELECT COUNT(track) AS plays,track FROM last
GROUP BY track 
ORDER BY plays DESC
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time);
```

## **To get the total time played:**
```sql
SELECT SEC_TO_TIME(SUM(duration)) AS time_played FROM last
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time);
```

## **Expression for finding the total plays:**
```sql
SELECT COUNT(track) AS plays FROM last WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time);
```

## **Expression for finding the average total plays:**
```sql
SELECT COUNT(track)/@avg AS plays FROM last WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time);

where 
    @avg is the time period (daily = 7, weekly = 54 or 4, monthly = 12)
```

### SQL Output Handler:   `> pager less -niS+G`

