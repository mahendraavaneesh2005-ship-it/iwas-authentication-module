import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { healthApplications } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET by ID
export async function GET(request: NextRequest, context: any) {
  try {
    const { id } = await context.params;

    const result = await db
      .select()
      .from(healthApplications)
      .where(eq(healthApplications.id, id))
      .limit(1);

    if (!result.length) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error as Error).message },
      { status: 500 }
    );
  }
}

// PATCH by ID
export async function PATCH(request: NextRequest, context: any) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updatedRows = await db
      .update(healthApplications)
      .set({ ...body, updatedAt: new Date().toISOString() })
      .where(eq(healthApplications.id, id))
      .returning();

    if (!updatedRows.length) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(updatedRows[0], { status: 200 });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE by ID
export async function DELETE(request: NextRequest, context: any) {
  try {
    const { id } = await context.params;

    const deletedRows = await db
      .delete(healthApplications)
      .where(eq(healthApplications.id, id))
      .returning();

    if (!deletedRows.length) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ deleted: true, application: deletedRows[0] }, { status: 200 });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error as Error).message },
      { status: 500 }
    );
  }
}
