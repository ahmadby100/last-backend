- ~~Top 5/10 from year/month/week~~
    - [x] Artist 
    - [x] Album
    - [x] Track
    - [x] Time Played
- ~~Total Plays (Scrobbles)~~
    - [x] Monthly Scrobbles
    - [x] Weekly Scrobbles
    - [x] Daily Scrobbles (Monthly)                         
  - [x] Average {Daily,Weekly,Monthly} Scrobbles

- ~~Listening Time (format: [weeks, days, hours, minutes, seconds])~~
    - [x] Monthly          
    - [x] Weekly           
    - [x] Daily  


- ~~Artist~~

    - [x] Number of Artists Listened To

    - [x] Top (5/10) Artist

    - [ ] On Repeat*            
    - [x] New Artists This [year, month, week]
- Album
  
    - [x] Number of Albums Listened To
    - [x] Top (5/10) Albums
    
    - [ ] On Repeat*            
    - [x] New Albums This [year, month, week]                   
- Tracks

  - [x] Number of Tracks Listened To
  - [x] Top (5/10) Tracks
  
  - [ ] On Repeat*            
  - [x] New Tracks This [year, month, week]
- Top Genre [year, month, week] 

- Listening Time 
    - [ ] Most Active Hour             			(WHERE HOUR(FROM_UNIXTIME(date)) = ${hour})
    - [ ] Average Scrobbles each Hour   (SELECT COUNT(track) FROM last WHERE HOUR(FROM_UNIXTIME(date)) = ${hour})           
    - [x] Most Active Day of the Week     (SELECT COUNT(track) FROM last WHERE HOUR(FROM_UNIXTIME(date)) = ${hour} ORDER BY )

- Most Active Day
   - [ ] Rank Most Active Days

     

Top Genre of the {periods}


- Present Dominant Genre as Color 
  - 

LRT for Genres:

![image-20210609211659052](https://raw.githubusercontent.com/ahmadby100/image-storage/main/image-20210609211659052.png)



   Table Format

```sql
CREATE TABLE last (
    track VARCHAR(250),
    track_mbid VARCHAR(250),
    artist VARCHAR(250),
    artist_mbid VARCHAR(250),
    album VARCHAR(250),
    album_mbid VARCHAR(250),
    date TIMESTAMP,
    day VARCHAR(250),
    duration INT,
    tags VARCHAR(250),
    track_sid VARCHAR(250),
    album_sid VARCHAR(250),
    artist_sid VARCHAR(250),
    album_image VARCHAR(250),
    artist_image VARCHAR(250,
    genres TEXT,
	acousticness FLOAT,
	danceability FLOAT,
	energy, FLOAT,
	instrumentalness FLOAT,
	s_key INT,
	liveness FLOAT,
	loudness FLOAT,
	mode INT, 
	speechiness FLOAT,
	tempo FLOAT,
	time_signature INT,
	valence FLOAT,
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

## **Expression to Find the Number of Tracks Played **


```sql 
SELECT last.*, FROM_UNIXTIME(date) AS date FROM last
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time);

where
     @time is the time period (week, month, year)
     @n is the number of time periods
```
- This returns the tracks that were listened to the past n week
  - <span name="#total_plays"> The number of tracks listened in the time period is the number of rows</span>
## **Expression To Find the Unique Number of Tracks **

```sql
SELECT track FROM last
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time)
GROUP BY track;
```
## **Expression To Find the Unique Number of Artists **

```sql
SELECT artist FROM last
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time)
GROUP BY artist;
```
## **Expression To Find the Unique Number of Albums **

```sql
SELECT album FROM last
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time)
GROUP BY album;
```

## **Expression to Find the Top Albums:**

```sql
SELECT COUNT(track) AS plays,album FROM last
GROUP BY album 
ORDER BY plays DESC
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time);
```
## **Expression to Find the Top Artists:**

```sql
SELECT COUNT(track) AS plays,artist FROM last
GROUP BY artist 
ORDER BY plays DESC
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time);
```
## **Expression to Find the Top Tracks:**

```sql
SELECT COUNT(track) AS plays,track FROM last
GROUP BY track 
ORDER BY plays DESC
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time);
```

## **Expression to Get the Total Time Played:**

```sql
SELECT SEC_TO_TIME(SUM(duration)) AS time_played FROM last
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time);
```

## **Expression to Get the Total Plays:**

```sql
SELECT COUNT(track) AS plays FROM last 
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time);
```

## **Expression to Find the Average Total Plays:**

```sql
SELECT COUNT(track)/@avg AS plays FROM last 
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time);

where 
    @avg is the time period (daily = 7, weekly = 54 or 4, monthly = 12)
```
## **Expression to Get New Artists Discovered**

```sql
SELECT artist FROM last 
WHERE date IN (
    SELECT min(date) FROM last 
    GROUP BY artist
) 
AND date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time);
```

## **Expression to Get New Album Discovered**

```sql
SELECT album FROM last 
WHERE date IN (
    SELECT min(date) FROM last 
    GROUP BY album 
)
AND date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time);
```

## **Expression to Get New Artists Discovered**

```sql
SELECT track FROM last 
WHERE date IN (
    SELECT min(date) FROM last 
    GROUP BY track
) 
AND date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time);
```

## **Expression to Get Plays by Hour**

```sql
SELECT COUNT(*) AS plays, HOUR(FROM_UNIXTIME(date)) AS hour FROM last 
WHERE date BETWEEN UNIX_TIMESTAMP() - (@n) * (@time) AND UNIX_TIMESTAMP() - (@n-1) * (@time);
GROUP BY hour
ORDER BY plays
```

### SQL Output Handler:   `> pager less -niS+G`

