/**
 * WordPress Integration Examples
 *
 * Example components demonstrating WordPress and WooCommerce integration
 * with the ONE platform.
 */

import { useEffect, useState } from "react";
import { Effect } from "effect";
import { DataProviderService, type Thing, type Event } from "../DataProvider";

// ============================================================================
// EXAMPLE 1: WordPress Blog Posts List
// ============================================================================

export function WordPressBlogList() {
  const [posts, setPosts] = useState<Thing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const program = Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // List WordPress blog posts
      const posts = yield* provider.things.list({
        type: "blog_post",
        status: "published",
        limit: 10,
      });

      return posts;
    });

    Effect.runPromise(program)
      .then((posts) => {
        setPosts(posts);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="blog-list">
      <h2>Latest Blog Posts</h2>
      {posts.map((post) => (
        <article key={post._id} className="blog-post-card">
          <h3>{post.name}</h3>
          <div
            dangerouslySetInnerHTML={{
              __html: post.properties.excerpt || "",
            }}
          />
          <a href={`/blog/${post.properties.slug}`}>Read more →</a>
        </article>
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: WooCommerce Product Grid
// ============================================================================

export function WooCommerceProductGrid() {
  const [products, setProducts] = useState<Thing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const program = Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // List WooCommerce products
      const products = yield* provider.things.list({
        type: "product",
        status: "active",
        limit: 12,
      });

      return products;
    });

    Effect.runPromise(program)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-64 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="product-grid grid grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product._id} className="product-card border rounded-lg p-4">
          {product.properties.images?.[0] && (
            <img
              src={product.properties.images[0].src}
              alt={product.name}
              className="w-full h-48 object-cover rounded mb-4"
            />
          )}
          <h3 className="font-bold text-lg">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-2">
            {product.properties.shortDescription}
          </p>
          <div className="flex justify-between items-center mt-4">
            <span className="text-2xl font-bold">
              ${product.properties.price.toFixed(2)}
            </span>
            {product.properties.onSale && (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                Sale!
              </span>
            )}
          </div>
          <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Create WordPress Post Form
// ============================================================================

export function CreateWordPressPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const program = Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Create WordPress post
      const postId = yield* provider.things.create({
        type: "blog_post",
        name: title,
        status,
        properties: {
          content,
          excerpt: content.substring(0, 150),
        },
      });

      return postId;
    });

    try {
      await Effect.runPromise(program);
      setSuccess(true);
      setTitle("");
      setContent("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Post</h2>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Post created successfully!
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded px-3 py-2 h-64"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "draft" | "published")}
          className="w-full border rounded px-3 py-2"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Creating..." : "Create Post"}
      </button>
    </form>
  );
}

// ============================================================================
// EXAMPLE 4: WooCommerce Order History
// ============================================================================

export function WooCommerceOrderHistory({ customerId }: { customerId: string }) {
  const [orders, setOrders] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const program = Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // List customer orders
      const orders = yield* provider.events.list({
        type: "order_completed",
        actorId: customerId,
        limit: 20,
      });

      return orders;
    });

    Effect.runPromise(program)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="order-history">
      <h2 className="text-2xl font-bold mb-4">Order History</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold">
                    Order #{order.metadata?.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded">
                  {order.metadata?.status}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {order.metadata?.lineItems?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between font-bold">
                <span>Total</span>
                <span>${order.metadata?.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: WordPress Category Filter
// ============================================================================

export function WordPressCategoryFilter() {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [posts, setPosts] = useState<Thing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load categories
    const program = Effect.gen(function* () {
      const provider = yield* DataProviderService;
      const knowledge = yield* provider.knowledge.list({
        knowledgeType: "label",
        limit: 50,
      });

      // Filter for category labels
      return knowledge.filter((k) =>
        k.labels?.some((label) => label.startsWith("category:"))
      );
    });

    Effect.runPromise(program)
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const program = Effect.gen(function* () {
        const provider = yield* DataProviderService;

        // Search posts by category
        const posts = yield* provider.things.list({
          type: "blog_post",
          status: "published",
          limit: 10,
        });

        // Filter by category (simplified - would use actual WP category filter)
        return posts.filter((post) =>
          post.properties.categories?.includes(selectedCategory)
        );
      });

      Effect.runPromise(program).then(setPosts);
    }
  }, [selectedCategory]);

  if (loading) return <div>Loading categories...</div>;

  return (
    <div className="category-filter">
      <h3 className="font-bold mb-3">Filter by Category</h3>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded ${
            !selectedCategory
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => setSelectedCategory(category.text)}
            className={`px-4 py-2 rounded ${
              selectedCategory === category.text
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {category.text}
          </button>
        ))}
      </div>

      {selectedCategory && (
        <div className="space-y-4">
          <h4 className="font-bold">Posts in "{selectedCategory}"</h4>
          {posts.length === 0 ? (
            <p className="text-gray-600">No posts in this category.</p>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="border-b pb-4">
                <h5 className="font-bold">{post.name}</h5>
                <p className="text-sm text-gray-600">
                  {post.properties.excerpt}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
