
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `crinfo`
--

CREATE DATABASE `crinfo` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 表的结构 `didinfo`
--

CREATE TABLE IF NOT EXISTS `didinfo` (
  `did` varchar(80) NOT NULL,
  `name` varchar(400) DEFAULT NULL,
  `nickname` varchar(400) DEFAULT NULL,
  `sex` varchar(400) DEFAULT NULL,
  `birthday` varchar(400) DEFAULT NULL,
  `url` varchar(400) DEFAULT NULL,
  `email` varchar(400) DEFAULT NULL,
  `areacode` varchar(400) DEFAULT NULL,
  `phone` varchar(400) DEFAULT NULL,
  `contry` varchar(400) DEFAULT NULL,
  `sumary` varchar(400) DEFAULT NULL,
  `website` varchar(400) DEFAULT NULL,
  `google` varchar(400) DEFAULT NULL,
  `microsoft` varchar(400) DEFAULT NULL,
  `facebook` varchar(400) DEFAULT NULL,
  `twitter` varchar(400) DEFAULT NULL,
  `weibo` varchar(400) DEFAULT NULL,
  `wechat` varchar(400) DEFAULT NULL,
  `alipay` varchar(400) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- 表的结构 `didtoken`
--

CREATE TABLE IF NOT EXISTS `didtoken` (
  `id` int(10) NOT NULL,
  `json` varchar(800) DEFAULT NULL,
  `token` text,
  `updatetime` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `didinfo`
--
ALTER TABLE `didinfo`
  ADD PRIMARY KEY (`did`);

--
-- Indexes for table `didtoken`
--
ALTER TABLE `didtoken`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `didtoken`
--
ALTER TABLE `didtoken`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
