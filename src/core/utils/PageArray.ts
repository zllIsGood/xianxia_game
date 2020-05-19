/**
 * 翻页数组
 * @author Peach.T 2010-5-3
 */

class PageArray {

	/**
	 * 每页数量
	 */
	private size: number;

	/**
	 * 当前页
	 */
	public currentPage: number;

	/**
	 * 外部数据接口
	 */
	public pageData: Array<any>;

	/**
	 * 数据源
	 */
	private dataSource: Array<any>;

	public constructor(source: Array<any>, size: number = 20) {

		this.dataSource = source;
		this.size = size;
		this.currentPage = 0;
		this.setPageData();
	}

	/**
	 *数据源长度
	 */
	public get length(): number {
		return this.dataSource.length;
	}

	/**
	 * 设置数据源
	 *
	 */
	public setPageData(): void {
		this.pageData = [];
		let index: number = this.currentPage * this.size;
		let nextIndex: number = (this.currentPage + 1) * this.size;
		let min: number = Math.min(this.length, nextIndex);
		for (let i: number = index; i < min; i++) {
			this.pageData.push(this.dataSource[i]);
		}
	}

	public getDataSource(): Array<any> {
		return this.dataSource;
	}

	public get totalPage(): number {
		return Math.ceil(this.length / this.size);
	}

	/**
	 * 是否有前一页
	 * @return
	 *
	 */
	public havePre(): boolean {
		return this.currentPage != 0; //没有数据，或者只有一页的情况，或者多页情况下在第一页的情况
	}

	/**
	 * 是否有下一页
	 * @return
	 *
	 */
	public haveNext(): boolean {
		return this.currentPage < this.totalPage - 1;//没有数据 ，或者在最后一页的情况
	}

	/**
	 * 向前翻页
	 *
	 */
	public prev(): void {
		this.currentPage--;
		this.setPageData();
	}

	/**
	 * 向后翻页
	 *
	 */
	public next(): void {
		this.currentPage++;
		this.setPageData();
	}

	/**
	 * 首页
	 *
	 */
	public first(): void {
		this.currentPage = 0;
		this.setPageData();
	}

	/**
	 * 末页
	 *
	 */
	public last(): void {
		this.currentPage = this.totalPage - 1;
		this.setPageData();
	}

	/**
	 * 跳转到多少页
	 * @param index 页数
	 *
	 */
	public gotoPage(index: number): void {
		if (this.totalPage < index) //没有这么多页
		{
			return;
		}
		else {
			this.currentPage = index - 1;
			this.setPageData();
		}
	}
}
