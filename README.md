<h1>What is Sunny Framework?</h1>
<p>
    <b>Sunny Framework</b> is a Ready-To-Use Web Article systems with Admin Systems for Management Article,
</p>
<h1>Engine and Requirements.</h1>
<p>
    This Web Article System is Running on Express, Nodejs and CSS Styling with SunnyUX.
</p>
<h1>.env file for configs.</h1>
<p>
You need to config couples things before starting SunnyFW
</p>
<p>
1) first things is to creating <b>.env</b> file containing variables as below.
</p>
<pre>
PORT=
MYSQL_HOST=
MYSQL_USERNAME=
MYSQL_PASSWORD=
MYSQL_DATABASE=
DEFAULT_PASSWORD=
crypto_secret=
</pre>
<p>
Sunny Framework will access this file (.env) to getting MySQL Users and Others Config such as hashing secret strings etc. without this file Sunny Framework will not able to access database and also cannot begin installing database structure processes.
</p>
<ul>
    <li><b>PORT</b> is port of nodejs appication you want SunnyFW to running on.</li>
    <li><b>DEFAULT_PASSWORD</b> is default admin password for first time installing databases.</li>
    <li><b>crypto_secret</b> is secret salt for secure hashing passwords.</li>
</ul>